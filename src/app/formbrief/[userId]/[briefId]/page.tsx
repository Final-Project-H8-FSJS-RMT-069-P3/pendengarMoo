import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/navbar";
import FormBrief from "@/server/models/FormBrief"; // Panggil Model Langsung
import Link from "next/link";

export default async function DetailBriefPage({
  params,
}: {
  params: { userId: string; briefId: string };
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { userId, briefId } = await params;

  // Proteksi: Hanya Doctor atau User pemilik yang bisa buka
  if (session.user.role !== "DOCTOR" && session.user.id !== userId) {
    redirect("/");
  }

  // 1. Ambil data langsung dari Database (Server-side)
  // Asumsi kamu punya method getById di model FormBrief
  const data = await FormBrief.getFormBriefById(briefId);

  if (!data) return notFound();

  // Helper parse jika brief masih string
  const brief =
    typeof data.brief === "string" ? JSON.parse(data.brief) : data.brief;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-28 pb-12 px-4">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/formbrief/${userId}`}
            className="group mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>{" "}
            Kembali ke Daftar
          </Link>

          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
            <div className="mb-8 border-b border-slate-50 pb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Detail Analisis
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                ID Rekam Medis: <span className="font-mono">{briefId}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  Nama Pasien
                </p>
                <p className="font-bold text-slate-800">
                  {brief.nama || "User"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  Kondisi Mood
                </p>
                <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase">
                  {brief.mood || "Normal"}
                </span>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Keluhan & Durasi
                </h3>
                <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                  <p className="text-sm leading-relaxed text-slate-700 italic">
                    "{brief.keluhanUtama?.join(", ")}. Sudah berlangsung selama{" "}
                    {brief.durasiKeluhan || "-"}."
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Hasil Analisis AI
                </h3>
                <div className="prose prose-slate prose-sm max-w-none bg-blue-50/50 p-6 rounded-2xl border border-blue-100 text-slate-800 leading-relaxed">
                  <ReactMarkdown>
                    {data.result || "Tidak ada analisis tersedia."}
                  </ReactMarkdown>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
