"use client";

import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ApiDoctor = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "psychiatrist";
  phoneNumber: string;
  address: string;
  psychiatristInfo?: {
    certificate?: string;
    experience?: number;
    scheduleDays?: string[];
    scheduleTimes?: string[];
    speciality?: string[];
    imageUrl?: string; // ← tambah ini
  };
};

type DoctorCard = {
  doctorId: string;
  name: string;
  role: string;
  harga: number;
  rating: number;
  reviews: number;
  tags: string[];
  imageUrl?: string;
  mode: string;
  exp: string;
  online: boolean;
  about: string;
  slots: string[];
};

const FALLBACK_TAGS = [
  ["Anxiety", "Self-Love"],
  ["Relationship", "Family"],
  ["Trauma", "Depression"],
  ["Burnout", "Growth"],
];

const FALLBACK_SLOTS = ["09:00", "11:00", "14:00", "16:00"];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function toDoctorCard(doctor: ApiDoctor, index: number): DoctorCard {
  const fallbackTags = FALLBACK_TAGS[index % FALLBACK_TAGS.length];
  const experience = doctor.psychiatristInfo?.experience;

  const specialties = doctor.psychiatristInfo?.speciality ?? [];
  const tags = specialties.length > 0 ? specialties : fallbackTags;
  const modeLabel =
    specialties.length > 0
      ? specialties.slice(0, 2).join(", ")
      : "Online & Offline";

  return {
    doctorId: doctor._id,
    name: doctor.name,
    role: "Psikiater",
    harga: 350000 + (index % 4) * 25000,
    rating: 4.7 + (index % 3) * 0.1,
    reviews: 50 + index * 7,
    tags: tags,
    imageUrl: doctor.psychiatristInfo?.imageUrl, // dari API, tidak ada fallback
    mode: modeLabel,
    exp: `${experience ?? 5} Tahun`,
    online: true,
    about:
      "Profesional kesehatan mental berlisensi yang siap membantu sesi konseling secara aman dan empatik.",
    slots:
      doctor.psychiatristInfo?.scheduleTimes &&
      doctor.psychiatristInfo.scheduleTimes.length > 0
        ? doctor.psychiatristInfo.scheduleTimes
        : FALLBACK_SLOTS,
  };
}

const FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Kecemasan", value: "Anxiety" },
  { label: "Depresi", value: "Depression" },
  { label: "Hubungan", value: "Relationship" },
  { label: "Keluarga", value: "Family" },
  { label: "Trauma", value: "Trauma" },
  { label: "Burnout", value: "Burnout" },
  { label: "Parenting", value: "Parenting" },
  { label: "Self-Love", value: "Self-Love" },
];

const TAG_COLOR: Record<string, string> = {
  Relationship: "bg-orange-50 text-orange-700",
  Stress: "bg-orange-50 text-orange-700",
  Burnout: "bg-orange-50 text-orange-700",
  Marriage: "bg-purple-50 text-purple-700",
  Trauma: "bg-purple-50 text-purple-700",
  Conflict: "bg-purple-50 text-purple-700",
  Growth: "bg-purple-50 text-purple-700",
};

export default function ListPsikolog() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorCard[]>([]);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortKey, setSortKey] = useState("rating");
  const [displayed, setDisplayed] = useState(6);
  const [modal, setModal] = useState<DoctorCard | null>(null);
  const [toast, setToast] = useState({ msg: "", show: false });

  const showToast = (msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2800);
  };

  const goToBookingForm = (doctorId: string) => {
    const params = new URLSearchParams({ staffId: doctorId });
    router.push(`/bookingform?${params.toString()}`);
  };

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch("/api/getdoctors", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const payload = (await response.json()) as { data?: ApiDoctor[] };
        const fetchedDoctors = (payload.data ?? []).map((doctor, index) =>
          toDoctorCard(doctor, index)
        );
        setDoctors(fetchedDoctors);
      } catch {
        setDoctors([]);
        showToast("Gagal mengambil data dokter. Coba lagi.");
      }
    }
    fetchDoctors();
  }, []);

  const filtered = doctors
    .filter((p) => {
      const matchTag = activeFilter === "all" || p.tags.includes(activeFilter);
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.role.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchTag && matchQuery;
    })
    .sort((a, b) => {
      if (sortKey === "rating") return b.rating - a.rating;
      if (sortKey === "price_asc") return a.harga - b.harga;
      if (sortKey === "price_desc") return b.harga - a.harga;
      if (sortKey === "reviews") return b.reviews - a.reviews;
      return 0;
    });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f8f9ff]">
        <section className="max-w-7xl mx-auto px-6 pt-14 mt-13 select-none">
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-bold py-1 px-4 rounded-full mb-5 uppercase tracking-wider">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Psikolog Terverifikasi & Berlisensi
          </span>
          <h1 className="text-5xl font-black text-blue-900 leading-[1.15] tracking-tighter mb-3">
            Temukan <span className="text-blue-600">Psikolog</span> yang Tepat
            Untukmu
          </h1>
          <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
            Pilih dari 50+ psikolog klinis berlisensi. Filter berdasarkan
            spesialisasi, harga, dan jadwal yang sesuai.
          </p>
          <div className="flex gap-8 mt-7 pt-7 border-t border-gray-200">
            {[
              { num: "50+", lbl: "Psikolog Aktif" },
              { num: "10.000+", lbl: "Sesi Selesai" },
              { num: "4.9★", lbl: "Rating Rata-rata" },
              { num: "<24 jam", lbl: "Jadwal Tercepat" },
            ].map((s) => (
              <div key={s.lbl}>
                <div className="text-2xl font-black text-blue-900">{s.num}</div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">
                  {s.lbl}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-8">
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex gap-3 items-center shadow-sm focus-within:shadow-md focus-within:border-blue-200 transition-all">
            <svg
              className="w-4 h-4 text-gray-400 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setDisplayed(6);
              }}
              placeholder="Cari psikolog, spesialisasi, atau topik..."
              className="flex-1 border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent"
            />
            <button className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-all active:scale-95">
              Cari Psikolog
            </button>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-4 flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">
            Spesialisasi
          </span>
          {FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => {
                setActiveFilter(value);
                setDisplayed(6);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeFilter === value
                  ? "bg-blue-900 text-white border-blue-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              {label}
            </button>
          ))}
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Menampilkan{" "}
            <span className="font-black text-blue-900">{filtered.length}</span>{" "}
            psikolog
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Urutkan:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white outline-none cursor-pointer focus:border-blue-400 transition-colors"
            >
              <option value="rating">Rating Tertinggi</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="reviews">Ulasan Terbanyak</option>
            </select>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-6 mb-10">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <svg
                className="w-14 h-14 mx-auto mb-4 opacity-40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3 className="text-lg font-bold text-gray-700 mb-1">
                Psikolog tidak ditemukan
              </h3>
              <p className="text-sm">
                Coba ubah filter atau kata kunci pencarian kamu
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.slice(0, displayed).map((p, i) => (
                <div
                  key={p.doctorId}
                  onClick={() => setModal(p)}
                  className="bg-white rounded-[24px] overflow-hidden border border-gray-200 hover:border-blue-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* ── Foto / Inisial ── */}
                  <div className="relative h-56 overflow-hidden bg-blue-50">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 group-hover:scale-105 transition-transform duration-500">
                        <span className="text-5xl font-black text-white select-none">
                          {getInitials(p.name)}
                        </span>
                      </div>
                    )}

                    {/* Badge Terverifikasi */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-blue-900/85 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Terverifikasi
                    </div>

                    {/* Badge Online/Offline */}
                    {p.online ? (
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-green-600 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Online
                      </div>
                    ) : (
                      <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-400 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        Offline
                      </div>
                    )}

                    {/* Badge Rating */}
                    <div className="absolute bottom-3.5 right-3.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 shadow-md">
                      <svg
                        className="w-3.5 h-3.5 text-yellow-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      {p.rating}
                      <span className="text-gray-400 font-normal">
                        ({p.reviews}+)
                      </span>
                    </div>
                  </div>

                  {/* ── Info Card ── */}
                  <div className="p-5">
                    <h3 className="text-lg font-black text-blue-900 mb-0.5 tracking-tight">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mb-3">
                      {p.role}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-[10.5px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wide ${
                            TAG_COLOR[tag] ?? "bg-blue-50 text-blue-800"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {p.mode} ·{" "}
                      <strong className="text-gray-600">
                        {p.reviews}+ ulasan
                      </strong>
                    </p>
                    <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-3">
                      <div>
                        <div className="text-xl font-black text-blue-900 leading-none">
                          Rp{p.harga.toLocaleString("id-ID")}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                          /sesi (50 menit)
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-700">
                          {p.exp}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Pengalaman
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex-1 bg-blue-900 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-900/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToBookingForm(p.doctorId);
                        }}
                      >
                        Booking Jadwal
                      </button>
                      <button
                        className="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal(p);
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="7" r="4" />
                          <path d="M20 21a8 8 0 10-16 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {displayed < filtered.length && (
          <div className="text-center pb-16">
            <button
              onClick={() =>
                setDisplayed((d) => Math.min(d + 3, filtered.length))
              }
              className="bg-white border border-gray-200 rounded-xl px-8 py-3.5 text-sm font-bold text-blue-900 hover:border-blue-400 hover:bg-blue-50 transition-all hover:-translate-y-px active:scale-95"
            >
              Tampilkan Lebih Banyak ↓
            </button>
          </div>
        )}

        {/* ── Modal ── */}
        {modal && (
          <div
            className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4"
            onClick={() => setModal(null)}
          >
            <div
              className="bg-white rounded-[24px] w-full max-w-lg max-h-[88vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-7">
                <button
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm transition-colors"
                  onClick={() => setModal(null)}
                >
                  ✕
                </button>
                <div className="flex gap-4 items-start mb-6">
                  {/* ── Foto / Inisial di Modal ── */}
                  {modal.imageUrl ? (
                    <img
                      src={modal.imageUrl}
                      alt={modal.name}
                      className="w-20 h-20 rounded-2xl object-cover object-top border-2 border-blue-50 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 border-2 border-blue-50 shrink-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-white select-none">
                        {getInitials(modal.name)}
                      </span>
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-black text-blue-900 tracking-tight mb-0.5">
                      {modal.name}
                    </h2>
                    <p className="text-sm text-gray-400 font-medium mb-2">
                      {modal.role}
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(modal.rating)
                              ? "text-yellow-400"
                              : "text-gray-200"
                          }`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                      <span className="text-sm font-bold text-blue-900 ml-1">
                        {modal.rating}
                      </span>
                      <span className="text-xs text-gray-400 ml-0.5">
                        ({modal.reviews}+ ulasan)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                    Tentang
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {modal.about}
                  </p>
                </div>
                <div className="mb-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                    Spesialisasi
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {modal.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-bold py-1.5 px-3 rounded-full bg-blue-50 text-blue-800 uppercase tracking-wide"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                    Detail
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { val: modal.exp, lbl: "Pengalaman" },
                      { val: modal.mode, lbl: "Mode Konseling" },
                      {
                        val: `Rp${modal.harga.toLocaleString("id-ID")}`,
                        lbl: "Per Sesi (50 menit)",
                      },
                      {
                        val: modal.online ? "✓ Tersedia" : "Sedang Offline",
                        lbl: "Status Saat Ini",
                      },
                    ].map(({ val, lbl }) => (
                      <div
                        key={lbl}
                        className="bg-gray-50 rounded-xl px-3.5 py-3"
                      >
                        <div className="text-base font-black text-blue-900 leading-none mb-0.5">
                          {val}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {lbl}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="w-full bg-orange-500 text-white py-3.5 rounded-2xl text-base font-black hover:bg-orange-600 transition-all active:scale-95 hover:shadow-lg hover:shadow-orange-200"
                  onClick={() => {
                    goToBookingForm(modal.doctorId);
                    setModal(null);
                  }}
                >
                  Booking Sekarang — Rp{modal.harga.toLocaleString("id-ID")}
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className={`fixed bottom-7 left-1/2 -translate-x-1/2 bg-blue-900 text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl z-[9999] transition-all duration-300 whitespace-nowrap ${
            toast.show
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6 pointer-events-none"
          }`}
        >
          {toast.msg}
        </div>
      </main>
    </>
  );
}
