"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAgoraVideoCall } from "@/hooks/useAgoraVideoCall";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "chat" | "notes";
type Message = {
  id: number;
  from: "doctor" | "user";
  text: string;
  timestamp: string;
  senderId?: string;
  senderName?: string;
};

type PusherConfigResponse = {
  key?: string;
  cluster?: string;
  error?: string;
};

const NOTES = [
  "Keluhan tidur tidak teratur sejak 3 minggu",
  "Stres pekerjaan meningkat bulan ini",
  "Teknik pernapasan 4-7-8 direkomendasikan",
];

// ─── Timer Hook ──────────────────────────────────────────────────────────────
function useSessionTimer(running: boolean) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  return useMemo(() => {
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [secs]);
}

// ─── UI Components (Style Asli) ────────────────────────────────────────────────
function VideoTrack({ track, className = "" }: { track: any; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!track || !ref.current) return;
    track.play(ref.current);
    return () => track.stop();
  }, [track]);
  return <div ref={ref} className={className} />;
}

function WaveBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-0.75">
      {[7, 13, 9, 15, 7].map((h, i) => (
        <span
          key={i}
          className="w-0.75 rounded-sm bg-emerald-500 transition-all duration-500"
          style={{
            height: h,
            opacity: active ? 1 : 0.2,
            transform: active ? "scaleY(1)" : "scaleY(0.35)",
            animation: active ? `waveAnim 0.8s ease-in-out ${i * 0.1}s infinite` : "none",
          }}
        />
      ))}
    </div>
  );
}

function CtrlBtn({ icon, label, muted, active, danger, big, onClick }: any) {
  const size = big ? "w-14 h-14 text-2xl" : "w-12 h-12 text-lg";
  const color = danger 
    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100" 
    : muted 
    ? "bg-red-50 border border-red-100 text-red-500" 
    : active 
    ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
    : "bg-blue-50 border border-blue-100 text-blue-900 hover:bg-blue-100";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button onClick={onClick} className={`flex items-center justify-center rounded-full transition-all active:scale-90 ${size} ${color}`}>
        {icon}
      </button>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${danger || muted ? "text-red-600" : "text-gray-500"}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function VideoCallContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";
  const currentUserName = session?.user?.name || "User";
  
  // AMBIL CHANNEL DARI URL (localhost:3000/videocall?channel=ROOM_ID)
  const channelName = searchParams.get("channel") ?? "";
  const mode = searchParams.get("mode") ?? "";
  const isChatOnly = mode === "chat-only";

  const {
    connectionState, localVideoTrack, remoteVideoTrack,
    isMicOn, isCamOn, isRemoteSpeaking, join, leave, toggleMic, toggleCam
  } = useAgoraVideoCall({
    channelName,
    onEnded: () => router.push("/bookinglist"),
  });

  const isConnected = connectionState === "connected";
  const timer = useSessionTimer(isConnected);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [mobChatOpen, setMobChatOpen] = useState(false);

  // Pusher Listener
  useEffect(() => {
    if (!channelName) return;
    let isMounted = true;
    let pusher: any = null;

    const setupPusher = async () => {
      const { default: PusherClient } = await import("pusher-js");
      if (!isMounted) return;

      const configRes = await fetch("/api/chat/send", { method: "GET" });
      const configData = (await configRes.json()) as PusherConfigResponse;

      if (!configRes.ok || !configData.key || !configData.cluster) {
        throw new Error(configData.error || "Pusher config is not available");
      }

      pusher = new PusherClient(configData.key, {
        cluster: configData.cluster,
      });

      const channel = pusher.subscribe(channelName);
      channel.bind("incoming-message", (data: any) => {
        const isMineById = !!currentUserId && data.senderId === currentUserId;
        const isMineByName =
          !data.senderId &&
          !!data.senderName &&
          data.senderName === currentUserName;

        // We already render local messages optimistically in sendMessage.
        // Ignore echoed events from Pusher for the same sender to avoid duplicates.
        if (isMineById || isMineByName) {
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            from: "doctor",
            text: data.message,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: new Date(data.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      });
    };

    setupPusher().catch((error) => {
      console.error("Pusher init error:", error);
    });

    return () => {
      isMounted = false;
      if (pusher) {
        pusher.unsubscribe(channelName);
        pusher.disconnect();
      }
    };
  }, [channelName, currentUserId, currentUserName]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(p => [...p, {
      id: Date.now(),
      from: "user",
      text,
      timestamp: time,
      senderId: currentUserId,
      senderName: currentUserName,
    }]);
    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelName,
          message: text,
          senderId: currentUserId,
          senderName: currentUserName,
        }),
      });
    } catch (e) { console.error(e); }
  }, [channelName, currentUserId, currentUserName]);

  if (!channelName) return <div className="h-screen flex items-center justify-center font-bold">Error: Channel ID diperlukan di URL</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes waveAnim { 0%,100% { transform: scaleY(0.4); opacity: 0.5; } 50% { transform: scaleY(1); opacity: 1; } }
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <div className="flex flex-col h-dvh bg-white text-gray-900 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
            <div>
              <p className="text-sm font-extrabold text-blue-900">{isChatOnly ? "Chat Sesi" : "Sesi Konsultasi"}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{isConnected ? "Aktif" : isChatOnly ? "Chat aktif" : "Menghubungkan..."}</p>
            </div>
          </div>
          {isConnected && (
            <div className="bg-gray-50 border px-4 py-1 rounded-full text-blue-900 font-mono font-bold">{timer}</div>
          )}
        </header>

        {/* Main Area */}
        {isChatOnly ? (
          <div className="flex-1 min-h-0 flex items-center justify-center p-6 bg-gray-50/50">
            <div className="w-full max-w-4xl h-[72vh] bg-white rounded-4xl border overflow-hidden shadow-xl">
              <ChatPanel messages={messages} onSend={sendMessage} />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_350px] md:gap-4 md:p-4 bg-gray-50/50">
            <div className="relative flex items-center justify-center overflow-hidden md:rounded-4xl bg-white border shadow-xl">
              {isConnected ? (
                <>
                  {remoteVideoTrack ? (
                    <VideoTrack track={remoteVideoTrack} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl">👨‍⚕️</div>
                      <WaveBars active={isRemoteSpeaking} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 w-28 h-36 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gray-100">
                    {isCamOn && localVideoTrack ? <VideoTrack track={localVideoTrack} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-[10px] font-bold text-gray-400">Cam Off</div>}
                  </div>
                </>
              ) : (
                <button onClick={join} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all">Bergabung Sekarang</button>
              )}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col bg-white rounded-4xl border overflow-hidden shadow-xl">
              <div className="flex p-2 bg-gray-50 border-b gap-1">
                {['chat', 'notes'].map((t) => (
                  <button key={t} onClick={() => setActiveTab(t as Tab)} className={`flex-1 py-2 text-[11px] font-bold rounded-full uppercase ${activeTab === t ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"}`}>
                    {t === "chat" ? "💬 Chat" : "📋 Catatan"}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-hidden">
                {activeTab === "chat" ? <ChatPanel messages={messages} onSend={sendMessage} /> : <div className="p-6 space-y-4">{NOTES.map((n, i) => <div key={i} className="text-sm text-gray-600 flex gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />{n}</div>)}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 py-5 bg-white border-t shrink-0 z-30">
          {!isChatOnly && (
            <>
              <CtrlBtn icon={isMicOn ? "🎙️" : "🔇"} label="Mic" muted={!isMicOn} onClick={toggleMic} />
              <CtrlBtn icon={isCamOn ? "📹" : "🚫"} label="Kamera" active={isCamOn} onClick={toggleCam} />
            </>
          )}

          <CtrlBtn icon="📵" label="Akhiri" danger big onClick={() => confirm("Akhiri sesi?") && leave()} />
          <div className="md:hidden"><CtrlBtn icon="💬" label="Chat" onClick={() => setMobChatOpen(true)} /></div>
        </div>

        {/* Mobile Overlay */}
        {mobChatOpen && (
          <div className="fixed inset-0 z-100 bg-white flex flex-col md:hidden">
            <header className="p-4 border-b flex justify-between items-center"><button onClick={() => setMobChatOpen(false)} className="text-blue-900 font-bold">✕ Tutup</button><span className="text-xs font-black uppercase">Chat Sesi</span><div className="w-10"/></header>
            <ChatPanel messages={messages} onSend={sendMessage} />
          </div>
        )}
      </div>
    </>
  );
}

// ─── Chat Panel Component (Style Asli) ─────────────────────────────────────────
function ChatPanel({ messages, onSend }: { messages: Message[], onSend: (t: string) => void }) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/30">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.from === "user" ? "items-end" : "items-start"}`}>
            <div className={`px-4 py-2.5 rounded-2xl text-[13px] max-w-[85%] shadow-sm ${m.from === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border text-gray-800 rounded-tl-none"}`}>
              {m.text}
            </div>
            <span className="text-[9px] text-gray-400 mt-1 font-bold">{m.timestamp}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2 bg-gray-50 border rounded-full px-4 py-1.5 focus-within:bg-white focus-within:shadow-md transition-all">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (onSend(input), setInput(""))} className="flex-1 bg-transparent text-sm outline-none py-1.5" placeholder="Tulis pesan..." />
          <button onClick={() => { onSend(input); setInput(""); }} className="text-blue-600 font-bold text-sm px-2">Kirim</button>
        </div>
      </div>
    </div>
  );
}

export default function VideoCallPage() {
  return <Suspense fallback={<div className="h-screen flex items-center justify-center">Memuat...</div>}><VideoCallContent /></Suspense>;
}