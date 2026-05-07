"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Brief {
  nama?: string;
  keluhanUtama?: string[];
  durasiKeluhan?: string;
  mood?: string;
}

interface FormBriefItem {
  _id: string;
  brief?: Brief | string;
  createdAt: string;
  result?: string;
}

export default function FormBriefListPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [data, setData] = useState<FormBriefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper untuk parsing data brief yang mungkin berbentuk string JSON
  const parseBrief = (briefData: any): Brief => {
    if (!briefData) return {};
    try {
      return typeof briefData === "string" ? JSON.parse(briefData) : briefData;
    } catch {
      return {};
    }
  };

  useEffect(() => {
    // Validasi dasar agar tidak menembak API dengan ID yang salah/undefined
    if (!userId || userId === "undefined") return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/formbrief?userId=${userId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Gagal mengambil data");
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 pb-12 pt-28">
        <div className="mx-auto max-w-5xl">
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <nav className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Link
                  href="/bookingform"
                  className="hover:text-blue-600 transition-colors"
                >
                  Bookings
                </Link>
                <span>/</span>
                <span className="text-blue-600">Form Brief History</span>
              </nav>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Riwayat Konsultasi
              </h1>
              <p className="text-sm text-slate-500">
                Menampilkan {data.length} catatan brief untuk pasien ini.
              </p>
            </div>
          </div>

          {/* Content Section */}
          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-3xl bg-white shadow-sm border border-slate-100">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Memuat Data...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
              <p className="font-bold text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-xs font-bold uppercase text-red-700 underline"
              >
                Coba Lagi
              </button>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
              <div className="mb-4 rounded-full bg-slate-50 p-4">
                <svg
                  className="h-8 w-8 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-bold text-slate-900">Belum Ada Data</p>
              <p className="text-sm text-slate-400">
                Pasien belum pernah mengisi form brief sebelumnya.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Tanggal & Waktu
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Nama Pasien
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Mood
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Keluhan
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.map((item) => {
                      const brief = parseBrief(item.brief);
                      return (
                        <tr
                          key={item._id}
                          className="group transition-colors hover:bg-blue-50/30"
                        >
                          <td className="whitespace-nowrap px-6 py-5">
                            <p className="font-bold text-slate-700">
                              {new Date(item.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(item.createdAt).toLocaleTimeString(
                                "id-ID",
                                { hour: "2-digit", minute: "2-digit" }
                              )}{" "}
                              WIB
                            </p>
                          </td>
                          <td className="px-6 py-5 font-extrabold text-slate-900">
                            {brief.nama || "User"}
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-600">
                              {brief.mood || "Normal"}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <p className="max-w-[200px] truncate text-xs text-slate-500">
                              {brief.keluhanUtama?.join(", ") || "-"}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/formbrief/${userId}/${item._id}`}
                              className="inline-flex items-center rounded-xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-600 transition-all hover:bg-blue-600 hover:text-white active:scale-95"
                            >
                              DETAIL
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
