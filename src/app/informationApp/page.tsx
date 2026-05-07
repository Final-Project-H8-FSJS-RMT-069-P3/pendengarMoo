"use client";

import Navbar from "@/components/navbar";
import { useState } from "react";

const steps = [
  {
    number: 1,
    color: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-700",
      dot: "bg-emerald-500",
      connector: "bg-emerald-200",
      numBg: "bg-emerald-100",
      numText: "text-emerald-700",
    },
    title: "Buat Akun",
    description:
      "Daftar menggunakan email atau nomor teleponmu. Isi profil dasar — ini membantu kami mencocokkan kamu dengan psikolog yang tepat.",
    tips: [
      "Gunakan nama asli agar psikolog bisa menyapamu dengan benar",
      "Tambahkan catatan singkat tentang apa yang ingin kamu kerjakan",
    ],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    number: 2,
    color: {
      bg: "bg-violet-50",
      text: "text-violet-800",
      iconBg: "bg-violet-100",
      iconText: "text-violet-700",
      dot: "bg-violet-500",
      connector: "bg-violet-200",
      numBg: "bg-violet-100",
      numText: "text-violet-700",
    },
    title: "Cari Psikolog",
    description:
      "Jelajahi daftar psikolog terverifikasi. Filter berdasarkan spesialisasi, bahasa, pengalaman, atau rating untuk menemukan yang paling cocok.",
    tips: [
      "Baca profil dan pendekatan setiap psikolog sebelum memutuskan",
      "Kamu bisa bookmark favorit untuk dibandingkan nanti",
    ],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    number: 3,
    color: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      iconBg: "bg-amber-100",
      iconText: "text-amber-700",
      dot: "bg-amber-500",
      connector: "bg-amber-200",
      numBg: "bg-amber-100",
      numText: "text-amber-700",
    },
    title: "Booking Sesi",
    description:
      "Pilih psikolog yang kamu rasa nyaman dan tap 'Book'. Pilih slot waktu yang tersedia sesuai jadwalmu.",
    tips: [
      "Sesi bisa dilakukan via video call online atau tatap muka",
      "Kamu akan langsung mendapat konfirmasi dan pengingat kalender",
    ],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    number: 4,
    color: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      iconBg: "bg-orange-100",
      iconText: "text-orange-700",
      dot: "bg-orange-500",
      connector: "bg-orange-200",
      numBg: "bg-orange-100",
      numText: "text-orange-700",
    },
    title: "Mulai Konseling",
    description:
      "Di waktu yang dijadwalkan, buka aplikasi dan bergabung ke sesi. Ceritakan dengan bebas — semua bersifat privat dan rahasia.",
    tips: [
      "Temukan tempat yang tenang dan privat sebelum memulai",
      "Kamu bisa berbagi catatan atau log suasana hati dengan psikolog",
    ],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    number: 5,
    color: {
      bg: "bg-sky-50",
      text: "text-sky-800",
      iconBg: "bg-sky-100",
      iconText: "text-sky-700",
      dot: "bg-sky-500",
      connector: "bg-sky-200",
      numBg: "bg-sky-100",
      numText: "text-sky-700",
    },
    title: "Pantau & Notifikasi",
    description:
      "Setelah sesi, pantau progres dan suasana hatimu dari waktu ke waktu. Dapatkan notifikasi untuk sesi mendatang, pesan baru, dan tips lanjutan dari psikolog.",
    tips: [
      "Aktifkan notifikasi push agar tidak melewatkan sesi",
      "Lihat riwayat suasana hati dan catatan sesi kapan saja di profilmu",
    ],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
];

const features = [
  {
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    title: "Pesan Langsung",
    desc: "Chat dengan psikologmu di antara sesi kapan saja kamu butuh dukungan.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    bg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconText: "text-violet-700",
    title: "Jurnal Mood",
    desc: "Catat emosi harian dan temukan pola suasana hatimu dari waktu ke waktu.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    title: "Laporan Progres",
    desc: "Lihat perjalanan kesehatanmu dengan grafik dan ringkasan sesi yang jelas.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    bg: "bg-rose-50",
    iconBg: "bg-rose-100",
    iconText: "text-rose-700",
    title: "Bantuan Darurat",
    desc: "Akses cepat ke sumber daya krisis dan kontak dukungan mendesak.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

export default function MentalHealthGuide() {
  const [expanded, setExpanded] = useState(null);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 py-10 px-4 mt-15">
        <div className="max-w-xl mx-auto">
          {/* Hero */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center mb-10">
            <p className="text-2xl font-bold text-blue-900">PendengarMu</p>

            <h1 className="text-2xl font-semibold text-orange-500 mb-2">
              Cara Menggunakan Aplikasi
            </h1>
            <p className="text-sm text-emerald-700 leading-relaxed max-w-xs mx-auto">
              Mulai perjalanan kesehatan mentalmu dalam beberapa langkah mudah.
              Kami selalu ada bersamamu.
            </p>
          </div>

          {/* Section Label */}
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">
            Langkah-langkah
          </p>

          {/* Steps */}
          <div className="flex flex-col mb-10">
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1;
              const isOpen = expanded === i;
              return (
                <div key={i} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${step.color.numBg} ${step.color.numText}`}
                    >
                      {step.number}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 min-h-6 my-1 ${step.color.connector}`}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <div className={`flex-1 ${isLast ? "" : "pb-5"}`}>
                    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <button
                        className="w-full text-left px-5 py-4 flex items-center gap-3"
                        onClick={() => setExpanded(isOpen ? null : i)}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${step.color.iconBg} ${step.color.iconText}`}
                        >
                          {step.icon}
                        </div>
                        <span className="text-sm font-medium text-slate-800 flex-1">
                          {step.title}
                        </span>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 border-t border-slate-50">
                          <p className="text-sm text-slate-500 leading-relaxed mt-3 mb-3">
                            {step.description}
                          </p>
                          <div className="flex flex-col gap-2">
                            {step.tips.map((tip, j) => (
                              <div key={j} className="flex items-start gap-2">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${step.color.dot}`}
                                />
                                <span className="text-xs text-slate-500 leading-relaxed">
                                  {tip}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features */}
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
            Fitur lainnya
          </p>
          <div className="grid grid-cols-2 gap-3 mb-10">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${f.iconBg} ${f.iconText}`}
                >
                  {f.icon}
                </div>
                <p className="text-sm font-medium text-slate-800 mb-1">
                  {f.title}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-emerald-900 mb-1">
                Siap memulai?
              </p>
              <p className="text-xs text-emerald-700">
                Konsultasi pertamamu hanya beberapa ketukan saja.
              </p>
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-150 whitespace-nowrap">
              Mulai sekarang
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
