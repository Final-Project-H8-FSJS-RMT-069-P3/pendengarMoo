"use client";
declare global {
  interface Window {
    snap: any;
  }
}

import Navbar from "@/components/navbar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { StartSessionButton } from "./StartSessionButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReviewModal } from "./ReviewModal";

type Booking = {
  _id: string;
  userId: string;
  staffId: string;
  date: string;
  sessionDuration: number;
  type: "videocall" | "chat-only" | "offline";
  amount: number;
  isPaid: boolean;
  isDone: boolean;
  isReviewed?: boolean;
  createdAt: string;
  userName: string;
  staffName: string;
};

type BookingApiResponse = {
  message: string;
  role?: "USER" | "DOCTOR";
  data?: Booking[];
};

type ReviewedBookingsResponse = {
  data?: string[];
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatSessionType = (type?: string) => {
  switch (type) {
    case "videocall":
      return "Video";
    case "chat-only":
      return "Chat";
    case "offline":
      return "Offline";
    default:
      return "Unknown";
  }
};
const handlePay = async (bookingId: string) => {
  try {
    const res = await fetch("/api/token-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookingId }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    if (window.snap) {
      window.snap.pay(data.token);
    } else {
      alert("Midtrans Snap belum load");
    }
  } catch (err) {
    console.error(err);
    alert("Gagal memulai pembayaran");
  }
};

export default function BookingListPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [role, setRole] = useState<"USER" | "DOCTOR" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickedDone, setClickedDone] = useState<Record<string, boolean>>({});
  const [clickedLoading, setClickedLoading] = useState<Record<string, boolean>>(
    {}
  );

  const [searchQuery, setSearchQuery] = useState("");
  // Payment filter temporarily disabled — commenting out to remove paid/unpaid filtering
  // const [paymentFilter, setPaymentFilter] = useState<"ALL" | "PAID" | "UNPAID">(
  //   "ALL",
  // );
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DONE" | "UPCOMING">(
    "ALL"
  );

  const router = useRouter();
  const sessionRole = String(session?.user?.role || "").toLowerCase();
  const isPsychiatrist =
    sessionRole === "doctor" || sessionRole === "psychiatrist";
  const isDoctor = role === "DOCTOR";
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  useEffect(() => {
    let isMounted = true;
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/getbookings", { cache: "no-store" });
        const payload = (await response.json()) as BookingApiResponse;
        if (!response.ok)
          throw new Error(payload.message || "Failed to fetch bookings");

        let normalizedBookings = payload.data || [];

        if (payload.role === "USER") {
          const reviewedResponse = await fetch("/api/reviews/me", {
            cache: "no-store",
          });

          if (reviewedResponse.ok) {
            const reviewedPayload =
              (await reviewedResponse.json()) as ReviewedBookingsResponse;
            const reviewedBookingIds = new Set(reviewedPayload.data || []);

            normalizedBookings = normalizedBookings.map((booking) => ({
              ...booking,
              isReviewed: reviewedBookingIds.has(booking._id),
            }));
          }
        }

        if (isMounted) {
          setBookings(normalizedBookings);
          setRole(payload.role || null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unexpected error happened"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBookings();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && bookings.length > 0 && role === "USER") {
      const doneBooking = bookings.find((b) => b.isDone && !b.isReviewed);

      if (doneBooking) {
        setReviewTarget(doneBooking);
      }
    }
  }, [loading, bookings, role]);
  async function handleMarkDone(bookingId: string, roomName?: string) {
    try {
      setClickedDone((s) => ({ ...s, [bookingId]: true }));
      setClickedLoading((s) => ({ ...s, [bookingId]: true }));
      const channel = roomName || bookingId;
      const res = await fetch("/api/video/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end-room", channelName: channel }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to mark done");
      // refresh bookings
      const resp = await fetch("/api/getbookings", { cache: "no-store" });
      const payload = await resp.json();
      if (resp.ok) setBookings(payload.data || []);
      else console.warn("Failed refresh after mark done", payload);
      setClickedLoading((s) => ({ ...s, [bookingId]: false }));
    } catch (err) {
      console.error(err);
      setClickedDone((s) => ({ ...s, [bookingId]: false }));
      setClickedLoading((s) => ({ ...s, [bookingId]: false }));
      alert("Gagal menandai selesai");
    }
  }

  const pageTitle = useMemo(() => {
    return role === "DOCTOR" ? "Daftar Booking Pasien" : "Daftar Booking Saya";
  }, [role]);

  const availableBalance = useMemo(() => {
    if (!isDoctor) return 0;
    return bookings.reduce(
      (acc, b) => acc + (b.isPaid && b.isDone ? b.amount : 0),
      0
    );
  }, [bookings, isDoctor]);

  const pendingBalance = useMemo(() => {
    if (!isDoctor) return 0;
    return bookings.reduce(
      (acc, b) => acc + (b.isPaid && !b.isDone ? b.amount : 0),
      0
    );
  }, [bookings, isDoctor]);

  const totalPatientsServed = useMemo(() => {
    if (!isDoctor) return 0;
    return bookings.reduce((acc, b) => acc + (b.isDone ? 1 : 0), 0);
  }, [bookings, isDoctor]);

  const getDisplayName = (booking: Booking) => {
    if (role === "DOCTOR") return booking.userName || "";
    if (role === "USER") return booking.staffName || "";
    return `${booking.userName || ""} ${booking.staffName || ""}`.trim();
  };

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      const name = getDisplayName(b).toLowerCase();
      if (q && !name.includes(q)) return false;
      // payment filter disabled
      // if (paymentFilter === "PAID" && !b.isPaid) return false;
      // if (paymentFilter === "UNPAID" && b.isPaid) return false;
      if (statusFilter === "DONE" && !b.isDone) return false;
      if (statusFilter === "UPCOMING" && b.isDone) return false;
      return true;
    });
  }, [bookings, searchQuery, statusFilter, role]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 pb-12 pt-28">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Booking List
            </p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
              {pageTitle}
            </h1>

            {isDoctor && (
              <div className="mt-4 flex flex-wrap items-start gap-4">
                <div className="min-w-35">
                  <div className="text-xs text-slate-500">
                    Finished Sessions Income
                  </div>
                  <div className="text-xl font-bold text-emerald-700">
                    {formatAmount(availableBalance)}
                  </div>
                </div>
                <div className="min-w-35">
                  <div className="text-xs text-slate-500">Pending Income</div>
                  <div className="text-xl font-bold text-amber-700">
                    {formatAmount(pendingBalance)}
                  </div>
                </div>
                <div className="min-w-35">
                  <div className="text-xs text-slate-500">Patients Served</div>
                  <div className="text-xl font-bold text-blue-700">
                    {totalPatientsServed}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                  aria-label="Search nama"
                />
              </div>
              <div className="flex items-center gap-4">
                {/* Payment filter removed */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Status</span>
                  <div className="flex gap-2">
                    {(["ALL", "DONE", "UPCOMING"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`text-xs px-2 py-1 rounded ${
                          statusFilter === f
                            ? f === "DONE"
                              ? "bg-green-600 text-white"
                              : f === "UPCOMING"
                                ? "bg-amber-600 text-white"
                                : "bg-blue-600 text-white"
                            : "bg-slate-100"
                        }`}
                      >
                        {f === "ALL"
                          ? "All"
                          : f === "DONE"
                            ? "Closed"
                            : "Upcoming"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {loading && (
            <div className="bg-white p-8 rounded-2xl shadow-sm">Loading...</div>
          )}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-red-700">
              {error}
            </div>
          )}
          {!loading && !error && bookings.length > 0 && (
            <>
              {/* ── DESKTOP TABLE ─────────────────────────── */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-left">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Nama</th>
                      <th className="px-4 py-3">Tipe Sesi</th>
                      <th className="px-4 py-3">Jumlah</th>
                      <th className="px-4 py-3">Payment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Sesion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-6 text-center text-slate-500"
                        >
                          No bookings found.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr
                          key={booking._id}
                          className="hover:bg-slate-50 border-t border-slate-50"
                        >
                          <td className="px-4 py-3">
                            {formatDateTime(booking.date)}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {role === "DOCTOR"
                              ? booking.userName
                              : booking.staffName}
                          </td>
                          <td className="px-4 py-3">
                            {formatSessionType(booking.type)}
                          </td>
                          <td className="px-4 py-3">
                            {formatAmount(booking.amount)}
                          </td>
                          {/* Payment — cursor default, tidak bisa diseleksi */}
                          <td className="px-4 py-3 cursor-default select-none">
                            {booking.isPaid ? (
                              <span className="text-green-600 font-semibold">
                                Paid
                              </span>
                            ) : (
                              <span className="text-amber-600 font-semibold">
                                Unpaid
                              </span>
                            )}
                          </td>
                          {/* Status — cursor default, tidak bisa diseleksi */}
                          <td className="px-4 py-3 cursor-default select-none">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${
                                booking.isDone
                                  ? "bg-slate-100 text-slate-500"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {booking.isDone ? "Closed" : "Upcoming"}
                            </span>
                          </td>
                          {/* Action — cursor pointer */}
                          <td className="px-4 py-3 cursor-pointer">
                            <div className="flex items-center gap-2">
                              {/* Pay Now — hanya untuk user yang belum bayar */}
                              {!isPsychiatrist && !booking.isPaid && (
                                <button
                                  onClick={() => handlePay(booking._id)}
                                  className="text-xs px-3 py-1.5 bg-orange-50 text-orange-600 font-semibold rounded-lg hover:bg-orange-100 transition-colors whitespace-nowrap border border-orange-200"
                                >
                                  Pay Now
                                </button>
                              )}
                              {/* Brief — hanya dokter */}
                              {isPsychiatrist && booking.userId && (
                                <button
                                  onClick={() =>
                                    router.push(`/formbrief/${booking.userId}`)
                                  }
                                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap border border-blue-100 cursor-pointer"
                                >
                                  Brief
                                </button>
                              )}
                              {/* Done button - both roles can mark done */}
                              {!booking.isDone && (
                                <button
                                  onClick={() => handleMarkDone(booking._id)}
                                  disabled={!!clickedDone[booking._id]}
                                  style={{
                                    cursor: clickedDone[booking._id]
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                  className={`flex-1 text-xs px-4 py-3 font-black rounded-xl border transition-all active:scale-95 ${
                                    clickedDone[booking._id]
                                      ? "bg-slate-100 text-slate-600 border-slate-200"
                                      : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                                  }`}
                                >
                                  {clickedLoading[booking._id] ? (
                                    <span className="inline-flex items-center">
                                      <svg
                                        className="animate-spin h-4 w-4 mr-2 text-slate-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                        ></path>
                                      </svg>
                                      Done
                                    </span>
                                  ) : (
                                    "Done"
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                          {/* Session — cursor pointer paksa ke semua child */}
                          <td className="px-4 py-3 cursor-pointer [&_*]:cursor-pointer">
                            {booking.isPaid && !booking.isDone && (
                              <StartSessionButton
                                bookingId={booking._id}
                                type={booking.type}
                              />
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── MOBILE CARDS ──────────────────────────── */}
              <div className="md:hidden space-y-4">
                {filteredBookings.length === 0 ? (
                  <div className="bg-white p-10 rounded-2xl text-slate-400 text-center shadow-sm">
                    No data found.
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                            {role === "DOCTOR" ? "Patient" : "Staff"}
                          </span>
                          <span className="font-extrabold text-slate-900 text-lg leading-tight">
                            {role === "DOCTOR"
                              ? booking.userName
                              : booking.staffName}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                            booking.isDone
                              ? "bg-slate-100 text-slate-400"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {booking.isDone ? "Done" : "Upcoming"}
                        </span>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-y-4 border-y border-slate-50 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                            Waktu Sesi
                          </span>
                          <span className="text-sm text-slate-700 font-bold">
                            {formatDateTime(booking.date)}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                            Tipe Sesi
                          </span>
                          <span className="text-sm text-slate-700 font-bold">
                            {formatSessionType(booking.type)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                            Total Bayar
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {formatAmount(booking.amount)}
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                            Pembayaran
                          </span>
                          {booking.isPaid ? (
                            <span className="text-sm text-green-600 font-black">
                              Lunas
                            </span>
                          ) : (
                            <span className="text-sm text-amber-600 font-black">
                              Belum Lunas
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons — berdampingan */}
                      <div className="flex items-center gap-2 kursor-pointer">
                        {/* Pay Now — user yang belum bayar */}
                        {!isPsychiatrist && !booking.isPaid && (
                          <button
                            onClick={() => handlePay(booking._id)}
                            className="flex-1 text-center text-xs px-4 py-3 bg-orange-50 text-orange-600 font-black rounded-xl border border-orange-200 hover:bg-orange-100 transition-all active:scale-95"
                          >
                            Pay Now
                          </button>
                        )}
                        {/* Start Session */}
                        {booking.isPaid && !booking.isDone && (
                          <div className="flex-1">
                            <StartSessionButton
                              bookingId={booking._id}
                              type={booking.type}
                            />
                          </div>
                        )}
                        {/* Brief — dokter */}
                        {isPsychiatrist && booking.userId && (
                          <button
                            onClick={() =>
                              router.push(`/formbrief/${booking.userId}`)
                            }
                            className="flex-1 text-xs px-4 py-3 bg-blue-50 text-blue-700 font-black rounded-xl border border-blue-100 hover:bg-blue-100 transition-all active:scale-95"
                          >
                            Lihat Brief
                          </button>
                        )}
                        {!booking.isDone && (
                          <button
                            onClick={() => handleMarkDone(booking._id)}
                            disabled={!!clickedDone[booking._id]}
                            className={`text-xs px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap border ${
                              clickedDone[booking._id]
                                ? "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed"
                                : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100 cursor-pointer"
                            }`}
                          >
                            {clickedLoading[booking._id] ? (
                              <span className="inline-flex items-center justify-center kursor-pointer">
                                <svg
                                  className="animate-spin h-4 w-4 mr-2 text-slate-600"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                  ></path>
                                </svg>
                                Done
                              </span>
                            ) : (
                              "Done"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
          {!loading && !error && bookings.length === 0 && (
            <div className="bg-white p-8 rounded-2xl shadow-sm text-slate-500 text-center">
              Tidak ada booking.
            </div>
          )}

          {reviewTarget && (
            <ReviewModal
              bookingId={reviewTarget._id}
              staffName={reviewTarget.staffName}
              onClose={() => setReviewTarget(null)}
              onSuccess={() => setReviewTarget(null)}
            />
          )}
        </div>
      </main>
    </>
  );
}
