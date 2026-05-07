// SNIPPET: Tambahkan ini ke src/app/bookinglist/page.tsx
//
// Tombol "Mulai Sesi" yang membuat room lalu redirect ke /videocall?channel=xxx
// Taruh di dalam card booking yang sudah isPaid: true

"use client";

import Image from "next/image";
import Swal from "sweetalert2";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Tempel fungsi ini di dalam komponen BookingList Anda
function StartSessionButton({
  bookingId,
  type,
}: {
  bookingId: string;
  type?: "videocall" | "chat-only" | "offline";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStartSession() {
    setLoading(true);
    setError("");

    try {
      // Try to fetch booking details first — if a Google Meet link exists for videocall, open it instead
      if (bookingId && type === "videocall") {
        try {
          const bres = await fetch(`/api/getbookings?bookingId=${bookingId}`, { cache: "no-store" });
          const bjson = await bres.json();
          if (bres.ok && bjson?.data) {
            const link = bjson.data.videoCallUrl || bjson.data.googleMeetLink || null;
            if (link) {
              // open meet link in new tab/window
              window.open(link, "_blank");
              return;
            }
          }
        } catch (err) {
          // ignore and fall back to normal room creation
          console.warn("Failed to fetch booking for meet link check", err);
        }
      }

      // Chat-only: route directly to videocall page in chat-only mode
      if (type === "chat-only") {
        router.push(`/videocall?channel=${bookingId}&mode=chat-only`);
        return;
      }

      // Offline session: no live session — show a message
      if (type === "offline") {
        await Swal.fire({
          icon: "info",
          title: "Offline session",
          text: "No Google Meet or Chatroom available. Check your Email for booking details",
        });
        return;
      }

      // Default: videocall flow (create room then redirect)
      const res = await fetch("/api/video/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-room", bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal memulai sesi");
        return;
      }

      // Redirect ke halaman video call dengan channelName sebagai query param
      router.push(`/videocall?channel=${data.roomName}`);
    } catch {
      setError("Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  }

  const label = loading
    ? "Memuat..."
    : type === "chat-only"
    ? "💬 Mulai Chat"
    : type === "offline"
    ? "ℹ️ Offline"
    : "Open Gmeet";

  const isGmeetLabel = type !== "chat-only" && type !== "offline";

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStartSession();
        }}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        {isGmeetLabel ? (
          <>
            <Image
              src="/uploads/icons8-google-meet-96%20(1).png"
              alt="Google Meet"
              width={16}
              height={16}
              className="h-4 w-4 shrink-0 brightness-0 invert"
            />
            <span>{label}</span>
          </>
        ) : (
          label
        )}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Contoh penggunaan di dalam render booking list:
//
// {booking.isPaid && !booking.isDone && (
//   <StartSessionButton bookingId={booking._id.toString()} />
// )}

export { StartSessionButton };
