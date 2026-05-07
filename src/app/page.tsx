"use client";

import Navbar from "@/components/navbar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Carousel3D from "@/components/animation";

type ApiDoctor = {
  _id: string;
  name: string;
  psychiatristInfo?: {
    certificate?: string;
    experience?: number;
    scheduleDays?: string[];
    speciality?: string[];
    imageUrl?: string; // ← tambah ini
  };
};

type DoctorCard = {
  _id: string;
  name: string;
  role: string;
  rating: string;
  reviews: string;
  tags: string[];
  imageUrl?: string; // ← ganti img jadi imageUrl, optional
};

type GetDoctorsResponse = {
  data?: ApiDoctor[];
};

type ApiReview = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
};

type GetReviewsResponse = {
  data?: ApiReview[];
  total?: number;
};

type ReviewCard = {
  text: string;
  name: string;
  type: string;
  initials: string;
  color: string;
  textColor?: string;
  rating: number;
};

const REVIEW_COLORS = [
  "bg-blue-900",
  "bg-blue-200",
  "bg-orange-400",
  "bg-purple-500",
];

const REVIEW_TEXT_COLORS = [
  "text-white",
  "text-blue-900",
  "text-white",
  "text-white",
];

const DEFAULT_DOCTOR_TAGS = ["Konseling", "Mental Health", "Terpercaya"];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const TABLE_ROWS = [
  { feature: "Psikolog Klinis Berlisensi", us: true, other: "dash" },
  { feature: "Pilihan Online & Offline", us: true, other: false },
  { feature: "Sistem Matching Psikolog", us: true, other: "dash" },
  { feature: "Privasi & Keamanan Data", us: true, other: true },
];

const FAQS = [
  {
    question: "Bagaimana cara booking sesi pertama saya?",
    answer:
      "Cukup pilih psikolog yang sesuai, tentukan jadwal yang nyaman, lalu lakukan pembayaran. setelah itu kamu bisa start sesion dengan klik button video call pada list booking",
  },
  {
    question: "Apakah identitas saya akan dijaga kerahasiaannya?",
    answer:
      "Ya, 100%. Seluruh data dan percakapan kamu bersifat rahasia dan tidak akan pernah dibagikan kepada pihak ketiga tanpa izin eksplisit darimu.",
  },
  {
    question: "Apakah pendengarMu menerima asuransi?",
    answer:
      "Saat ini kami belum bekerja sama dengan penyedia asuransi. Namun kami menyediakan harga yang transparan dan terjangkau agar layanan ini bisa diakses semua kalangan.",
  },
  {
    question: "Apa perbedaan psikolog dan psikiater?",
    answer:
      "Psikolog berfokus pada terapi bicara dan pendekatan psikologis, sedangkan psikiater adalah dokter medis yang dapat meresepkan obat. Jika tidak yakin mana yang dibutuhkan, tim kami siap membantu mengarahkanmu.",
  },
];

const FOOTER_COLS = [
  {
    title: "Layanan",
    links: [
      "Konseling Online",
      "Konseling Offline",
      "Counseling for Kids",
      "Corporate Wellness",
    ],
  },
  {
    title: "Perusahaan",
    links: ["Tentang Kami", "Lokasi Kami", "Karir", "Kontak"],
  },
  {
    title: "Bantuan",
    links: ["Kebijakan Privasi", "Syarat & Ketentuan", "FAQ", "Bantuan Refund"],
  },
];

const cards = [
  {
    id: "offline",
    type: "Konseling Offline",
    imgSrc:
      "https://i.pinimg.com/1200x/31/59/c8/3159c84f6346445fa11cc3d879348148.jpg",
    reviews: "70+",
    reviewSource: "Google Maps",
    subtitle: "Rumah Bicara",
    locations: ["Jakarta Barat", "Jakarta Selatan"],
    features: [
      "Ruangan konseling yang nyaman",
      "Efektivitas konseling maksimal",
      "Langsung bertemu psikolog & konseling tatap muka",
      "Bisa melakukan test assessment & psikoterapi yang lengkap",
    ],
    originalPrice: 549000,
    discount: 28,
    finalPrice: 399000,
    highlighted: false,
  },
  {
    id: "online",
    type: "Konseling Online",
    imgSrc:
      "https://i.pinimg.com/1200x/19/87/af/1987af8b782e8397fcdd88e22bb76895.jpg",
    reviews: "779+",
    reviewSource: "Google",
    subtitle: "via Whatsapp atau Google Meet",
    locations: null,
    features: [
      "Biaya lebih hemat",
      "Jadwal tercepat <24 jam & tempat fleksible",
      "Kamu bisa memilih untuk konseling via voice atau video call",
      "Privasimu dijamin 100% aman",
    ],
    originalPrice: 349000,
    discount: 28,
    finalPrice: 249000,
    highlighted: true,
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="border border-blue-100 rounded-2xl p-6 hover:border-blue-300 transition-colors cursor-pointer group"
    >
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg text-gray-900 pr-4">{question}</h4>
        <svg
          className={`w-6 h-6 text-blue-900 transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M19 9l-7 7-7-7"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {open && (
        <p className="mt-4 text-gray-500 text-sm leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const qnaHref = session ? "/qna" : "/login";
  const [reviewIdx, setReviewIdx] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorCard[]>([]);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewCard[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes scroll-left {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/getdoctors", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }

        const result: GetDoctorsResponse = await response.json();
        const mappedDoctors: DoctorCard[] = (result.data ?? []).map(
          (doctor) => ({
            _id: doctor._id,
            name: doctor.name,
            role:
              doctor.psychiatristInfo?.certificate || "Psikolog Profesional",
            rating: "5.0",
            reviews:
              doctor.psychiatristInfo?.experience !== undefined
                ? `${doctor.psychiatristInfo.experience}+`
                : "Baru",
            tags: doctor.psychiatristInfo?.speciality || DEFAULT_DOCTOR_TAGS,
            imageUrl: doctor.psychiatristInfo?.imageUrl, // dari API, tidak ada fallback
          })
        );

        if (isMounted) {
          setDoctors(mappedDoctors);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        if (isMounted) {
          setDoctors([]);
        }
      } finally {
        if (isMounted) {
          setIsDoctorsLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews?limit=20", {
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Failed to fetch reviews");

        const result: GetReviewsResponse = await response.json();
        const mapped: ReviewCard[] = (result.data ?? []).map((r, i) => ({
          text: r.comment,
          name: r.userName,
          type: "Client",
          initials: getInitials(r.userName).slice(0, 1),
          color: REVIEW_COLORS[i % REVIEW_COLORS.length],
          textColor: REVIEW_TEXT_COLORS[i % REVIEW_TEXT_COLORS.length],
          rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
        }));

        if (isMounted) {
          setReviews(mapped);
          setTotalReviews(
            typeof result.total === "number"
              ? result.total
              : (result.data ?? []).length
          );
        }
      } catch (error) {
        console.error("Gagal untuk mengambil reviews:", error);
        if (isMounted) {
          setReviews([]);
          setTotalReviews(0);
        }
      } finally {
        if (isMounted) setIsReviewsLoading(false);
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-[#f8f9ff] py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 select-none">
              <span className="inline-block py-1 px-4 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
                #1 Psikolog Terpercaya di Indonesia
              </span>
              <h1 className="text-5xl lg:text-7xl font-black text-blue-900 leading-[1.1] tracking-tighter mb-6">
                Bicarakan Masalahmu,{" "}
                <span className="text-blue-600">Temukan Kedamaianmu.</span>
              </h1>
              <p className="text-lg text-gray-500 mb-10 max-w-xl leading-relaxed">
                Akses layanan konseling psikologi profesional secara online
                maupun offline dengan psikolog berlisensi yang siap mendengarkan
                tanpa menghakimi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={qnaHref}
                  className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Konseling Sekarang
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href="/listpsikolog"
                  className="bg-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                >
                  List Psikolog Kami
                </Link>
              </div>
            </div>
            <div className="relative w-full py-20">
              <div className="absolute inset-0 bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative z-10 w-full h-[550px] flex items-center justify-center">
                <Carousel3D
                  background="transparent"
                  showReflection={true}
                  radius={300}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              {(() => {
                const specialtiesLabel =
                  doctors &&
                  doctors.length > 0 &&
                  doctors[0].tags &&
                  doctors[0].tags.length > 0
                    ? doctors[0].tags.slice(0, 3).join(", ")
                    : "Online & Offline";

                const FEATURES = [
                  {
                    title: "Spesialisasi",
                    desc: specialtiesLabel,
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    ),
                  },
                  {
                    title: "Biaya Terjangkau",
                    desc: "Kesehatan mental untuk semua dengan harga yang transparan dan kompetitif.",
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    ),
                  },
                  {
                    title: "Psikolog Terpercaya",
                    desc: "Seluruh tim kami adalah psikolog klinis yang telah melewati seleksi ketat.",
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    ),
                  },
                ];

                return FEATURES.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 p-6 rounded-2xl hover:bg-blue-50/50 transition-colors group"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-900 group-hover:scale-110 transition-transform">
                      <svg
                        className="w-7 h-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        {item.icon}
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1 text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-blue-900 tracking-tight mb-4">
                Temukan Psikolog yang Tepat
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Pilih partner berceritamu berdasarkan spesialisasi dan jadwal
                yang sesuai dengan kebutuhanmu.
              </p>
            </div>

            <div className="overflow-hidden pb-10">
              <div
                className="flex gap-8 w-max"
                style={{ animation: "scroll-left 30s linear infinite" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.animationPlayState = "paused")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.animationPlayState = "running")
                }
              >
                {isDoctorsLoading ? (
                  <p className="py-20 text-gray-500 font-medium">
                    Memuat data psikolog...
                  </p>
                ) : doctors.length === 0 ? (
                  <p className="py-20 text-gray-500 font-medium">
                    Belum ada data psikolog tersedia.
                  </p>
                ) : (
                  [...doctors, ...doctors].map((p, idx) => (
                    <div
                      key={`${p._id}-${idx}`}
                      className="w-[360px] shrink-0 bg-white rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100 flex flex-col"
                    >
                      {/* ── Foto / Inisial ── */}
                      <div className="relative h-72 overflow-hidden bg-blue-50">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 group-hover:scale-105 transition-transform duration-500">
                            <span className="text-5xl font-black text-white select-none">
                              {getInitials(p.name)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-8 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-blue-900 mb-1">
                          {p.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">{p.role}</p>

                        {/* Tags — max 3, sisanya jadi +N */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {p.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-bold py-1 px-3 bg-blue-50 text-blue-900 rounded-full uppercase tracking-wider"
                            >
                              {t}
                            </span>
                          ))}
                          {p.tags.length > 3 && (
                            <span className="text-[10px] font-bold py-1 px-3 bg-gray-100 text-gray-400 rounded-full uppercase tracking-wider">
                              +{p.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Button selalu di bawah */}
                        <button className="w-full py-3 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors active:scale-95 mt-auto">
                          <Link href="/listpsikolog">Booking Jadwal</Link>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/listpsikolog"
                className="text-blue-900 font-bold hover:underline flex items-center justify-center gap-2 text-base"
              >
                Lihat Semua Psikolog Kami
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/3">
                <div className="inline-flex items-center gap-2 mb-4 bg-yellow-50 text-yellow-700 px-4 py-1.5 rounded-full font-bold text-sm">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Users Review
                </div>
                <h2 className="text-4xl font-black text-blue-900 tracking-tight mb-4">
                  {isReviewsLoading
                    ? "Memuat review..."
                    : `${totalReviews}+ Reviews`}
                </h2>
                <p className="text-gray-500 leading-relaxed">
                  Kepercayaan Anda adalah prioritas kami. Simak apa yang mereka
                  katakan setelah berkonsultasi dengan tim pendengarMu.
                </p>

                <div className="mt-8 flex gap-2">
                  <button
                    onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))}
                    disabled={reviewIdx === 0 || reviews.length <= 1}
                    className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M15 19l-7-7 7-7"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setReviewIdx(
                        Math.min(Math.max(reviews.length - 2, 0), reviewIdx + 1)
                      )
                    }
                    disabled={
                      reviewIdx >= Math.max(reviews.length - 2, 0) ||
                      reviews.length <= 2
                    }
                    className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M9 5l7 7-7 7"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 flex gap-2">
                  {Array.from({ length: Math.max(reviews.length - 1, 1) }).map(
                    (_, i) => (
                      <button
                        key={i}
                        onClick={() => setReviewIdx(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          reviewIdx === i
                            ? "w-6 bg-blue-900"
                            : "w-2 bg-gray-300"
                        }`}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="md:w-2/3 flex gap-6 overflow-hidden">
                {isReviewsLoading ? (
                  <p className="text-gray-500 font-medium">
                    Memuat data review...
                  </p>
                ) : reviews.length === 0 ? (
                  <p className="text-gray-500 font-medium">
                    Belum ada review tersedia.
                  </p>
                ) : (
                  reviews.slice(reviewIdx, reviewIdx + 2).map((r, i) => (
                    <div
                      key={reviewIdx + i}
                      className="w-full md:w-80 shrink-0 bg-blue-50 p-8 rounded-[2rem] transition-all duration-300"
                    >
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            className={`w-4 h-4 ${
                              s <= r.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <p className="italic text-gray-700 mb-6">"{r.text}"</p>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${r.color} ${
                            r.textColor || "text-white"
                          } flex items-center justify-center font-bold`}
                        >
                          {r.initials}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            {r.name}
                          </p>
                          <p className="text-xs text-gray-400">{r.type}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[#f8f9ff]">
          <div className="flex flex-col items-center px-4 py-8">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">
              Layanan pendengarMu
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-10 max-w-lg">
              Pilih medium konseling yang nyaman untukmu
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`relative rounded-2xl bg-white flex flex-col overflow-hidden border-2 transition-all duration-300 cursor-default
                    ${
                      card.highlighted
                        ? "border-blue-500 shadow-2xl shadow-blue-100 scale-[1.02]"
                        : "border-gray-200 shadow-lg hover:border-blue-400 hover:shadow-xl hover:scale-[1.01]"
                    }`}
                >
                  <div className="absolute top-4 right-4 z-10 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                    -{card.discount}%
                  </div>
                  <div className="h-52 overflow-hidden bg-blue-50">
                    <img
                      src={card.imgSrc}
                      alt={card.type}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        hoveredCard === card.id ? "scale-105" : "scale-100"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-6 gap-4">
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {card.type}
                      </h2>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            viewBox="0 0 20 20"
                            className="w-4 h-4"
                            fill="#F59E0B"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">{card.subtitle}</p>
                      {card.locations && (
                        <div className="flex items-center justify-center gap-3 mt-1 text-sm text-gray-600">
                          {card.locations.map((loc) => (
                            <span key={loc}>
                              <svg
                                viewBox="0 0 24 24"
                                className="w-3.5 h-3.5 inline mr-0.5"
                                fill="#EF4444"
                              >
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                              </svg>
                              {loc}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-100" />
                    <ul className="flex flex-col gap-3 flex-1">
                      {card.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-3 text-sm text-gray-700 leading-snug"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 flex-shrink-0"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="11"
                              fill="#EEF4FF"
                              stroke="#3B82F6"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M7.5 12l3 3 6-6"
                              stroke="#3B82F6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 text-center">
                      <div className="flex items-center justify-center gap-3 mb-0.5" />
                      <div className="flex items-end justify-center gap-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-black text-center text-blue-900 mb-16 tracking-tight">
              Mengapa pendengarMu?
            </h2>
            <div className="overflow-hidden rounded-[2rem] border border-gray-100 shadow-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-6 text-blue-900 font-black uppercase text-xs tracking-widest">
                      Fitur Layanan
                    </th>
                    <th className="p-6 text-blue-900 font-black text-center bg-blue-100/50">
                      pendengarMu
                    </th>
                    <th className="p-6 text-gray-400 font-black text-center">
                      Lainnya
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {TABLE_ROWS.map((row) => (
                    <tr
                      key={row.feature}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-6 font-medium text-gray-700">
                        {row.feature}
                      </td>
                      <td className="p-6 text-center">
                        <svg
                          className="w-5 h-5 text-green-500 mx-auto"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </td>
                      <td className="p-6 text-center">
                        {row.other === true ? (
                          <svg
                            className="w-5 h-5 text-green-500 mx-auto"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : row.other === false ? (
                          <svg
                            className="w-5 h-5 text-red-500 mx-auto"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-400 mx-auto"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M20 12H4"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-24 bg-blue-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-black text-center text-blue-900 mb-20 tracking-tight">
              3 Langkah Menuju Bahagia
            </h2>
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="hidden md:block absolute top-10 left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-0.5 border-t-2 border-dashed border-blue-200 z-0" />
              {[
                {
                  n: "1",
                  title: "Pilih Layanan",
                  desc: "Pilih psikolog dan jadwal yang sesuai dengan preferensimu.",
                },
                {
                  n: "2",
                  title: "Bicara dengan Psikolog",
                  desc: "Sampaikan apa yang kamu rasakan dalam sesi yang aman.",
                },
                {
                  n: "3",
                  title: "Sembuh & Bertumbuh",
                  desc: "Dapatkan insight dan tools untuk hidup yang lebih berkualitas",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="relative z-10 text-center flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-blue-800 text-white flex items-center justify-center font-black text-2xl mb-8 shadow-lg shadow-blue-200">
                    {s.n}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {s.title}
                  </h3>
                  <p className="text-gray-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-black text-center text-blue-900 mb-16 tracking-tight">
              Pertanyaan Populer
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <FaqItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-blue-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
              Mulai Perjalanan Kesehatan Mentalmu Hari Ini
            </h2>
            <p className="text-blue-200 text-xl mb-12 max-w-2xl mx-auto">
              Jangan menunggu sampai kewalahan. Psikolog kami siap membantu
              kapan pun kamu membutuhkan teman bicara.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="/login"
                className="bg-orange-500 text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-transform active:scale-95"
              >
                Booking Sekarang
              </Link>
              <Link
                href="/login"
                className="bg-white text-blue-900 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 transition-transform active:scale-95"
              >
                Konsultasi Gratis via Chat
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 py-16 max-w-7xl mx-auto text-sm text-gray-500">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-3xl font-black text-blue-900 mb-4 block tracking-tighter"
            >
              pendengarMu
            </Link>
            <p className="leading-relaxed mb-6">
              Partner terpercaya untuk kesehatan mental Anda. Menghubungkan Anda
              dengan profesional berlisensi secara mudah dan terjangkau.
            </p>
            <div className="flex gap-4">
              {[
                <svg
                  key="ig"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    strokeWidth={1.5}
                  />
                  <path
                    d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"
                    strokeWidth={1.5}
                  />
                  <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
                </svg>,
                <svg
                  key="tw"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                    strokeWidth={1.5}
                  />
                </svg>,
                <svg
                  key="em"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    strokeWidth={1.5}
                  />
                  <polyline points="22,6 12,13 2,6" strokeWidth={1.5} />
                </svg>,
              ].map((icon, i) => (
                <Link
                  key={i}
                  href="/"
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all"
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-blue-900 mb-6 text-base">
                {col.title}
              </h4>
              <ul className="space-y-4">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      href="/"
                      className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-8 py-6 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-xs">
            © 2026 pendengarMu. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </>
  );
}
