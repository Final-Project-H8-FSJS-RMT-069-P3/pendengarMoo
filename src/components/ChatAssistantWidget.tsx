"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Message = {
  role: "user" | "ai";
  content: string;
};

type HistoryItem = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

const starterSuggestions = [
  "Cara booking psikolog gimana?",
  "Halaman payment ada di mana?",
  "Cara lihat list booking saya?",
];

const storageKey = "pmu-chat-widget-open";

export default function ChatAssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hai, aku asisten PendengarMu. Aku bisa bantu kamu cari halaman atau alur fitur di website ini.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "1") setOpen(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, open ? "1" : "0");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const historyForApi = useMemo<HistoryItem[]>(() => {
    return messages.map((m) => ({
      role: m.role === "ai" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  }, [messages]);

  const handleSend = async (seed?: string) => {
    const text = (seed ?? input).trim();
    if (!text || typing) return;

    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/ai-psikolog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          type: "chat",
          currentPath: pathname,
          history: historyForApi,
        }),
      });

      const data = await res.json();
      const content =
        typeof data?.response === "string" && data.response.trim()
          ? data.response
          : "Maaf, aku belum bisa memproses itu sekarang. Coba lagi ya.";

      setMessages((prev) => [...prev, { role: "ai", content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Koneksi lagi bermasalah. Coba sebentar lagi, aku siap bantu navigasi website kamu.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-80">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-blue-600 text-white px-4 py-3 shadow-xl hover:bg-blue-700 transition-colors"
          aria-label="Buka asisten chat"
        >
          Asisten Website
        </button>
      )}

      {open && (
        <div className="w-[calc(100vw-2rem)] sm:w-130 lg:w-150 h-145 max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-linear-to-r from-blue-600 to-cyan-500 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">AI Asisten PendengarMu</p>
              <p className="text-[11px] opacity-90">Bantu kamu keliling website</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/90 hover:text-white text-sm"
              aria-label="Sembunyikan asisten chat"
            >
              Tutup
            </button>
          </div>

          <div className="px-3 pt-3 flex gap-2 flex-wrap border-b border-gray-100 pb-3">
            {starterSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSend(s)}
                className="text-xs px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                  } ${msg.role === "ai" ? "whitespace-pre-wrap" : ""}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya soal halaman atau fitur..."
                className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={typing}
                className="h-10 px-3 rounded-xl bg-blue-600 text-white text-sm font-medium disabled:opacity-60 hover:bg-blue-700"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
