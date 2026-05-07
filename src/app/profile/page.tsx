"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PsychiatristInfo = {
  certificate?: string;
  experience?: number;
  about?: string;
  price?: number;
  mode?: string;
  speciality?: string[];
  imageUrl?: string;
  imageId?: string;
  roleSpecialist?: string;
  scheduleDays?: string[];
  scheduleTimes?: string[];
  paket?: { type: "videocall" | "chat-only" | "offline"; price: number }[];
};

type CalendarConnectionInfo = {
  connected: boolean;
  providerEmail: string | null;
  connectedAt: string | null;
  updatedAt: string | null;
};

type UserProfile = {
  name: string;
  email: string;
  role: "user" | "psychiatrist";
  phoneNumber: string;
  address: string;
  psychiatristInfo?: PsychiatristInfo;
  googleCalendar?: CalendarConnectionInfo;
};

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatRupiah(num: number) {
  return "Rp" + num.toLocaleString("id-ID");
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center bg-blue-50 rounded-2xl px-6 py-5 min-w-[100px]">
      <span className="text-2xl font-black text-blue-900">{value}</span>
      <span className="text-xs text-gray-500 mt-1 font-medium text-center">
        {label}
      </span>
    </div>
  );
}

function BadgeTag({ text }: { text: string }) {
  return (
    <span className="inline-block text-[11px] font-bold py-1 px-3 bg-blue-100 text-blue-800 rounded-full uppercase tracking-wider">
      {text}
    </span>
  );
}

export default function ProfileViewPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
        const d = data.data;
        setProfile({
          name: d.name || "",
          email: d.email || "",
          role: d.role || "user",
          phoneNumber: d.phoneNumber || "",
          address: d.address || "",
          psychiatristInfo: d.psychiatristInfo || {},
          googleCalendar: d.googleCalendar || {
            connected: false,
            providerEmail: null,
            connectedAt: null,
            updatedAt: null,
          },
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-700 animate-spin" />
          <p className="text-blue-900 font-semibold">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">
            {error || "Profil tidak ditemukan"}
          </p>
          <Link
            href="/"
            className="text-blue-700 hover:underline font-semibold"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const info = profile.psychiatristInfo;
  const isPsychiatrist = profile.role === "psychiatrist";
  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const connectGoogleCalendar = async () => {
    try {
      setCalendarLoading(true);
      const res = await fetch("/api/calendar/connect?returnTo=/profile", {
        method: "GET",
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.message || "Failed to connect Google Calendar");
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to connect Google Calendar");
    } finally {
      setCalendarLoading(false);
    }
  };

  const disconnectGoogleCalendar = async () => {
    try {
      setCalendarLoading(true);
      const res = await fetch("/api/calendar/disconnect", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to disconnect Google Calendar");
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              googleCalendar: {
                connected: false,
                providerEmail: null,
                connectedAt: null,
                updatedAt: null,
              },
            }
          : prev,
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to disconnect Google Calendar");
    } finally {
      setCalendarLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] font-sans">
      {/* ── Header Band ─────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              className="w-4 h-4 text-blue-400 group-hover:-translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-2xl font-black text-blue-900 tracking-tighter leading-none">
              pendengarMu
            </span>
          </Link>
          <Link
            href="/profile/editprofile"
            className="flex items-center gap-1.5 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Profil
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* ── Hero Card ───────────────────────────────────── */}
        <div className="relative bg-blue-900 rounded-3xl overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-7 flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0">
              {isPsychiatrist && info?.imageUrl ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-2xl">
                  <img
                    src={info.imageUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 ring-4 ring-white/20 shadow-2xl flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    isPsychiatrist
                      ? "bg-orange-500 text-white"
                      : "bg-blue-700 text-blue-200"
                  }`}
                >
                  {isPsychiatrist ? "Psikolog" : "Klien"}
                </span>
                {isPsychiatrist && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-300">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Aktif
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {profile.name || "—"}
              </h1>

              {isPsychiatrist &&
                (info?.roleSpecialist || info?.certificate) && (
                  <p className="text-blue-300 text-sm font-medium mt-0.5">
                    {info?.roleSpecialist}
                    {info?.roleSpecialist && info?.certificate ? " · " : ""}
                    {info?.certificate}
                  </p>
                )}

              {isPsychiatrist && info?.about && (
                <p className="mt-3 text-blue-100/80 text-sm leading-relaxed max-w-lg line-clamp-3">
                  {info.about}
                </p>
              )}
            </div>
          </div>

          {isPsychiatrist && (
            <div className="relative z-10 border-t border-white/10 grid grid-cols-3 divide-x divide-white/10">
              {info?.experience !== undefined && (
                <div className="py-4 text-center">
                  <p className="text-xl font-black text-white">
                    {info.experience}+
                  </p>
                  <p className="text-[11px] text-blue-300 font-semibold mt-0.5">
                    Tahun Pengalaman
                  </p>
                </div>
              )}
              {info?.price !== undefined && (
                <div className="py-4 text-center">
                  <p className="text-xl font-black text-white">
                    {formatRupiah(info.price)}
                  </p>
                  <p className="text-[11px] text-blue-300 font-semibold mt-0.5">
                    Per Sesi
                  </p>
                </div>
              )}
              {info?.speciality && info.speciality.length > 0 && (
                <div className="py-4 text-center">
                  <p className="text-xl font-black text-white">
                    {info.speciality.length}
                  </p>
                  <p className="text-[11px] text-blue-300 font-semibold mt-0.5">
                    Spesialisasi
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Contact Info ─────────────────────────────────── */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-blue-50 px-8 py-6">
          <h2 className="text-base font-black text-blue-900 uppercase tracking-widest mb-5 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
            Informasi Kontak
          </h2>
          <div className="space-y-4">
            {[
              {
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                ),
                label: "Email",
                value: profile.email,
              },
              {
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                ),
                label: "Telepon",
                value: profile.phoneNumber || "—",
              },
              {
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                label: "Alamat",
                value: profile.address || "—",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-blue-50 px-8 py-6">
          <h2 className="text-base font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Google Calendar
          </h2>

          <p className="text-sm text-gray-600 mb-5">
            Connect your Google account so paid bookings can be validated against your calendar automatically.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Status
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {profile.googleCalendar?.connected
                  ? `Connected as ${profile.googleCalendar.providerEmail || profile.email}`
                  : "Not connected"}
              </p>
            </div>

            {profile.googleCalendar?.connected ? (
              <button
                type="button"
                onClick={disconnectGoogleCalendar}
                disabled={calendarLoading}
                className="px-5 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 disabled:opacity-60"
              >
                {calendarLoading ? "Disconnecting..." : "Disconnect"}
              </button>
            ) : (
              <button
                type="button"
                onClick={connectGoogleCalendar}
                disabled={calendarLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 disabled:opacity-60"
              >
                {calendarLoading ? "Connecting..." : "Connect Google Calendar"}
              </button>
            )}
          </div>
        </div>

        {/* ── Psychiatrist Only Sections ───────────────────── */}
        {isPsychiatrist && (
          <>
            {info?.speciality && info.speciality.length > 0 && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-blue-50 px-8 py-6">
                <h2 className="text-base font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Spesialisasi
                </h2>
                <div className="flex flex-wrap gap-2">
                  {info.speciality.map((s, i) => (
                    <BadgeTag key={i} text={s} />
                  ))}
                </div>
              </div>
            )}

            {info?.paket && info.paket.length > 0 && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-blue-50 px-8 py-6">
                <h2 className="text-base font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Paket Konseling
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {info.paket.map((p, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 bg-white border border-blue-100 rounded-2xl px-5 py-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
                    >
                      {p.type === "chat-only" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="#2346dd"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-4.724l-4.762 2.857a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2h-1a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-2.8 9.286a1 1 0 0 0 -1.414 .014a2.5 2.5 0 0 1 -3.572 0a1 1 0 0 0 -1.428 1.4a4.5 4.5 0 0 0 6.428 0a1 1 0 0 0 -.014 -1.414m-5.69 -4.286h-.01a1 1 0 1 0 0 2h.01a1 1 0 0 0 0 -2m5 0h-.01a1 1 0 0 0 0 2h.01a1 1 0 0 0 0 -2" />
                        </svg>
                      )}
                      {p.type === "videocall" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="#2346dd"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M15 4a1 1 0 0 1 1 1v1.01l.014 .103a1 1 0 0 1 -.014 .887v1l4.447 -2.224a1 1 0 0 1 1.553 .834v10.798a1 1 0 0 1 -1.553 .833l-4.447 -2.223v1a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-12a1 1 0 0 1 1 -1z" />
                        </svg>
                      )}
                      {p.type === "offline" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="#2346dd"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
                          <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5z" />
                        </svg>
                      )}
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {p.type === "chat-only"
                          ? "Chat"
                          : p.type === "videocall"
                            ? "Video Call"
                            : "Offline"}
                      </span>
                      <span className="text-lg font-black text-blue-900">
                        {formatRupiah(p.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {((info?.scheduleDays && info.scheduleDays.length > 0) ||
              (info?.scheduleTimes && info.scheduleTimes.length > 0)) && (
              <div className="bg-white rounded-[2rem] shadow-sm border border-blue-50 px-8 py-6">
                <h2 className="text-base font-black text-blue-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Jadwal Tersedia
                </h2>

                {info?.scheduleDays && info.scheduleDays.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Hari Praktik
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {DAY_ORDER.map((day) => {
                        const active = info.scheduleDays!.includes(day);
                        return (
                          <span
                            key={day}
                            className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
                              active
                                ? "bg-blue-700 text-white shadow-sm"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {info?.scheduleTimes && info.scheduleTimes.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Jam Tersedia
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {info.scheduleTimes
                        .slice()
                        .sort()
                        .map((t) => {
                          const hour = parseInt(t.split(":")[0]);
                          const display = `${t} – ${hour
                            .toString()
                            .padStart(2, "0")}:50`;
                          return (
                            <span
                              key={t}
                              className="text-xs font-bold px-4 py-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-200"
                            >
                              {display}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* CTA for user role */}
        {!isPsychiatrist && (
          <div className="bg-blue-900 rounded-[2rem] px-8 py-8 text-center relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
            <p className="text-blue-200 text-sm font-semibold mb-2 relative z-10">
              Butuh bantuan psikolog?
            </p>
            <h3 className="text-2xl font-black text-white mb-5 relative z-10">
              Mulai sesi konseling sekarang
            </h3>
            <Link
              href="/listpsikolog"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg active:scale-95 transition-all relative z-10"
            >
              Temukan Psikolog
            </Link>
          </div>
        )}
      </div>

      <div className="text-center py-8 text-xs text-gray-400">
        © 2026 <span className="font-bold text-blue-900">pendengarMu</span>. Hak
        Cipta Dilindungi.
      </div>
    </div>
  );
}
