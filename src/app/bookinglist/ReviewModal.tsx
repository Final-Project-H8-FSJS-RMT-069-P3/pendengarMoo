"use client";

import { useState } from "react";

type Props = {
  bookingId: string;
  staffName: string;
  onClose: () => void;
  onSuccess: (bookingId: string) => void;
};

export function ReviewModal({
  bookingId,
  staffName,
  onClose,
  onSuccess,
}: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) return setError("Pilih rating dulu ya");
    if (!comment.trim()) return setError("Tulis komentarmu dulu");

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSuccess(bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Review Sesi
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">
              Bagaimana pengalaman kamu?
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Sesi dengan{" "}
              <span className="font-semibold text-slate-700">{staffName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Bintang */}
        <div className="mb-4 flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="text-3xl transition-transform hover:scale-110"
            >
              {star <= (hovered || rating) ? "⭐" : "☆"}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ceritakan pengalamanmu dengan doktermu atau menggunakan pendengarMu..."
          rows={4}
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />

        {error && (
          <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>
        )}

        {/* Buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Nanti saja
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Mengirim..." : "Kirim Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
