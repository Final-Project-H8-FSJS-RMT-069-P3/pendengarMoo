import Navbar from "@/components/navbar";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="bg-white font-sans antialiased text-gray-900">
        <header className="relative bg-blue-900 text-white py-40 overflow-hidden select-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <span className="inline-block bg-orange-500/20 border border-orange-400/40 text-orange-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              🤝 Bersama Merawat Kesehatan Mental
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.1]">
              Tentang <span className="text-orange-400">pendengarMu</span>
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-blue-200 leading-relaxed">
              Kami hadir sebagai teman yang mendengar — menghubungkan Anda
              dengan psikolog berlisensi untuk perjalanan kesehatan mental yang
              lebih baik.
            </p>
          </div>
        </header>

        <main className="bg-white rounded-3xl max-w-7xl mx-auto px-10 py-16 -mt-10 mb-20 shadow-lg">
          <section className="mb-20">
            <div className="flex flex-col md:flex-row items-center gap-14">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-black text-blue-900 tracking-tight leading-snug">
                  Cerita <span className="text-orange-400">Kami</span>
                </h2>
                <h2 className="text-3xl font-black text-blue-900 tracking-tight mb-6 leading-snug">
                  Hadir dari Kepedulian yang{" "}
                  <span className="text-blue-600">Tulus</span>
                </h2>
                <p className="text-gray-500 mb-4 leading-relaxed">
                  pendengarMu lahir pada 2021 dari keyakinan sederhana: setiap
                  orang berhak mendapatkan dukungan kesehatan mental yang mudah
                  dijangkau dan bebas stigma.
                </p>
                <p className="text-gray-500 mb-4 leading-relaxed">
                  Kami membangun jembatan antara individu yang membutuhkan
                  bantuan dengan psikolog dan konselor berpengalaman — kapan
                  saja, di mana saja.
                </p>
                <p className="text-gray-500 leading-relaxed">
                  Hingga kini, ribuan klien telah merasakan manfaat nyata dari
                  sesi konseling yang aman, nyaman, dan profesional bersama
                  kami.
                </p>
              </div>
              <div className="md:w-1/2 relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-blue-100/50 rounded-[2.5rem]" />
                <img
                  src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1000&q=80"
                  alt="Sesi Konseling"
                  className="relative rounded-[2.5rem] shadow-xl w-full h-auto object-cover rotate-1"
                />
              </div>
            </div>
          </section>

          <section className="bg-[#f8f9ff] rounded-[2rem] p-12 mb-20">
            <div className="text-center max-w-4xl mx-auto">
              <span className="inline-block py-5 px-10 rounded-full bg-blue-100 text-blue-700 text-800 font-bold uppercase tracking-wider mb-4">
                Misi Kami
              </span>
              <h2 className="text-3xl font-black text-blue-900 tracking-tight mb-6">
                Mengapa Kami Ada
              </h2>
              <p className="text-lg text-gray-500 mb-10 italic leading-relaxed">
                &quot;Menyediakan layanan kesehatan mental yang hangat,
                terpercaya, dan terjangkau bagi semua orang Indonesia — tanpa
                terkecuali.&quot;
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-transparent hover:border-blue-100 hover:shadow-xl w-full sm:w-64 transition-all duration-300 group flex flex-col items-center text-center">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-900 mb-5 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    Empati Tanpa Syarat
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    Kami percaya setiap orang berhak didengar tanpa penilaian.
                    Lingkungan kami aman dan bebas stigma.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-transparent hover:border-blue-100 hover:shadow-xl w-full sm:w-64 transition-all duration-300 group flex flex-col items-center text-center">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-900 mb-5 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    Profesional Berlisensi
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    Semua psikolog kami tersertifikasi dan berpengalaman.
                    Privasi Anda terlindungi sepenuhnya.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-transparent hover:border-blue-100 hover:shadow-xl w-full sm:w-64 transition-all duration-300 group flex flex-col items-center text-center">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-900 mb-5 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    Mudah Diakses
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    Konseling dari rumah lewat chat atau video call. Fleksibel
                    sesuai jadwal dan kebutuhan Anda.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <div className="text-center mb-12">
              <span className="inline-block py-5 px-10 rounded-full bg-blue-100 text-blue-700 text-700 font-bold uppercase tracking-wider mb-4">
                Tim Kami
              </span>
              <h2 className="text-3xl font-black text-blue-900 tracking-tight">
                Para Ahli di Balik pendengarMu
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80"
                    alt="Dr. Sari Kusuma"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-blue-900 mb-1">
                    Vincentius E.
                  </h3>
                  <p className="text-orange-500 font-bold text-sm mb-3">
                    Team Leader
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Psikolog klinis dengan 15 tahun pengalaman, berfokus pada
                    terapi kognitif-perilaku dan kesehatan mental perempuan.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
                    alt="Budi Santoso"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-blue-900 mb-1">
                    Brandon L.
                  </h3>
                  <p className="text-orange-500 font-bold text-sm mb-3">
                    Authentication, Fullstack Support
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Spesialis konseling remaja dan keluarga, berpengalaman di
                    rumah sakit jiwa dan klinik komunitas selama 10 tahun.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80"
                    alt="Dewi Rahayu"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-blue-900 mb-1">
                    Bambang H. A.
                  </h3>
                  <p className="text-orange-500 font-bold text-sm mb-3">
                    Frontend Lead
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Ahli tumbuh kembang anak dan konseling keluarga, penulis
                    buku &apos;Mendampingi Anak di Era Digital&apos;.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-5">
              <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80"
                    alt="Dr. Sari Kusuma"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-blue-900 mb-1">
                    Akmal H. R.
                  </h3>
                  <p className="text-orange-500 font-bold text-sm mb-3">
                    Backend Database & Models
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Psikolog klinis dengan 15 tahun pengalaman, berfokus pada
                    terapi kognitif-perilaku dan kesehatan mental perempuan.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
                    alt="Budi Santoso"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-blue-900 mb-1">
                    Viyansyah
                  </h3>
                  <p className="text-orange-500 font-bold text-sm mb-3">
                    AI Lead
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Spesialis konseling remaja dan keluarga, berpengalaman di
                    rumah sakit jiwa dan klinik komunitas selama 10 tahun.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-100">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80"
                    alt="Dewi Rahayu"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-blue-900 mb-1">
                    Rizki
                  </h3>
                  <p className="text-orange-500 font-bold text-sm mb-3">
                    Backend Komunikasi & Payment
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Ahli tumbuh kembang anak dan konseling keluarga, penulis
                    buku &apos;Mendampingi Anak di Era Digital&apos;.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-blue-50/50 rounded-[2rem] p-12 mb-20">
            <div className="text-center mb-10">
              <span className="inline-block py-5 px-10 rounded-full bg-blue-100 text-blue-700 text-700 font-bold uppercase tracking-wider mb-4">
                Dampak Kami
              </span>
              <h2 className="text-3xl font-black text-blue-900 tracking-tight">
                Kepercayaan yang Kami Jaga
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-black text-blue-900 mb-1">
                  12K+
                </div>
                <div className="text-gray-500 text-sm">Klien Terbantu</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-black text-blue-900 mb-1">
                  95+
                </div>
                <div className="text-gray-500 text-sm">Psikolog Berlisensi</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-black text-orange-500 mb-1">
                  4.9★
                </div>
                <div className="text-gray-500 text-sm">Rating Kepuasan</div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-black text-blue-900 mb-1">
                  98%
                </div>
                <div className="text-gray-500 text-sm">Klien Kembali Lagi</div>
              </div>
            </div>
          </section>

          <section className="bg-blue-900 text-white rounded-[2rem] p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-black tracking-tighter mb-4">
                Mulai Perjalanan Kesehatan Mentalmu Hari Ini
              </h2>
              <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                Sesi pertama gratis. Temukan psikolog yang tepat untuk Anda dan
                mulai langkah pertama menuju hidup yang lebih seimbang.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-orange-500 text-white font-bold px-10 py-4 rounded-xl shadow-2xl hover:scale-105 transition-transform active:scale-95 text-lg flex items-center justify-center gap-2">
                  Booking Sekarang
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button className="bg-white text-blue-900 font-bold px-10 py-4 rounded-xl shadow-2xl hover:scale-105 transition-transform active:scale-95 text-lg">
                  Lihat List Psikolog
                </button>
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
                Partner terpercaya untuk kesehatan mental Anda. Menghubungkan
                Anda dengan profesional berlisensi secara mudah dan terjangkau.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/"
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all"
                >
                  <svg
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
                  </svg>
                </Link>
                <Link
                  href="/"
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                      strokeWidth={1.5}
                    />
                  </svg>
                </Link>
                <Link
                  href="/"
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 hover:bg-blue-900 hover:text-white transition-all"
                >
                  <svg
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
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-blue-900 mb-6 text-base">
                Layanan
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Konseling Online
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Konseling Offline
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Counseling for Kids
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Corporate Wellness
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-blue-900 mb-6 text-base">
                Perusahaan
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Lokasi Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Karir
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-blue-900 mb-6 text-base">
                Bantuan
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-gray-400 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                  >
                    Bantuan Refund
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-8 py-6 border-t border-gray-100 text-center">
            <p className="text-gray-400 text-xs">
              © 2026 pendengarMu. Hak Cipta Dilindungi.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
