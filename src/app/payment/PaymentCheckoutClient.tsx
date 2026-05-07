"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PaymentCheckoutClientProps = {
  amount: number;
  itemId: string;
  itemName: string;
  orderId: string;
  bookingId?: string;
  drName?: string;
};

type PaymentItem = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

type PaymentRequestPayload = {
  orderId: string;
  bookingId?: string;
  grossAmount: number;
  items: PaymentItem[];
  customerDetails: {
    first_name: string;
    email: string;
  };
};

type PaymentApiResponse = {
  token: string;
  redirect_url: string;
};

type UserProfileResponse = {
  data?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
};

type Doctor = {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  psychiatristInfo?: {
    specialization?: string;
    experience?: string;
    schedule?: string;
    price?: number;
  };
};

type DoctorsApiResponse = {
  message: string;
  data: Doctor[];
};

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatExperience = (exp?: string | number) => {
  if (exp === undefined || exp === null) return "";
  const str = String(exp).trim();
  if (!str) return "";
  if (/tahun/i.test(str) || /year/i.test(str)) return str;
  return `${str} Tahun`;
};

export default function PaymentCheckoutClient({
  amount,
  itemId,
  itemName,
  orderId,
  bookingId,
  drName,
}: PaymentCheckoutClientProps) {
  const [profileLoading, setProfileLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(!!drName); // fetch hanya kalau drName ada
  const [bookingInfo, setBookingInfo] = useState<null | { amount: number; type?: string; staffName?: string }>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload: PaymentRequestPayload = useMemo(
    () => ({
      orderId,
      bookingId,
      grossAmount: bookingInfo?.amount ?? amount,
      items: [
        { id: itemId, price: bookingInfo?.amount ?? amount, quantity: 1, name: bookingInfo?.type ? `${itemName} (${bookingInfo.type})` : itemName },
      ],
      customerDetails: { first_name: firstName, email },
    }),
    [amount, bookingId, email, firstName, itemId, itemName, orderId, bookingInfo]
  );

  // Fetch user profile
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const result = (await response.json()) as UserProfileResponse;
        if (!response.ok || !result.data)
          throw new Error(result.message || "Failed to fetch user profile");
        if (isMounted) {
          setFirstName(result.data.name || "");
          setEmail(result.data.email || "");
        }
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch doctor by drName
  useEffect(() => {
    if (!drName) return;

    let isMounted = true;
    const fetchDoctor = async () => {
      try {
        const response = await fetch("/api/getdoctors", { cache: "no-store" });
        const result = (await response.json()) as DoctorsApiResponse;
        if (!response.ok) throw new Error("Failed to fetch doctors");

        const matched = result.data.find(
          (d) => d.name.toLowerCase() === drName.toLowerCase()
        );
        if (isMounted) setDoctor(matched ?? null);
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (isMounted) setLoadingDoctor(false);
      }
    };
    fetchDoctor();
    return () => {
      isMounted = false;
    };
  }, [drName]);

  // If bookingId provided, fetch booking details and override amount/drName
  useEffect(() => {
    if (!bookingId) return;
    let isMounted = true;
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/getbookings?bookingId=${bookingId}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to fetch booking");
        if (!isMounted) return;
        const d = json.data;
        setBookingInfo({ amount: Number(d.amount || 0), type: d.type, staffName: d.staffName });
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Unknown error");
      }
    };
    fetchBooking();
    return () => { isMounted = false };
  }, [bookingId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!firstName || !email) {
      setError("Data user belum tersedia. Silakan refresh halaman.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as
        | PaymentApiResponse
        | { error?: string };
      if (!response.ok)
        throw new Error(
          (data as { error?: string }).error ||
            "Failed to create payment transaction"
        );
      window.location.href = (data as PaymentApiResponse).redirect_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            Kembali ke Home
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            Payment Checkout
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* ===== KIRI: Form Pembayaran ===== */}
          <div className="pl-10 flex-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-900">
                Data Pembayaran
              </h2>

              {drName && (
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Psikolog
                  </label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    {bookingInfo?.staffName ?? drName}
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Order ID
                  </label>
                  <div className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    {orderId}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Item ID
                    </label>
                    <div className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      {itemId}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Item Name
                    </label>
                    <div className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      {itemName}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Amount (IDR)
                  </label>
                  <div className="w-full rounded-lg border border-slate-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900">
                    {formatIDR(bookingInfo?.amount ?? amount)}
                  </div>

                  {bookingInfo?.type && (
                    <div className="mt-2">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Session Type</label>
                      <div className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700">
                        {bookingInfo.type}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring"
                      placeholder={profileLoading ? "Memuat..." : "Nama depan"}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring"
                      placeholder={
                        profileLoading ? "Memuat..." : "email@contoh.com"
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || profileLoading}
                className="mt-6 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {profileLoading
                  ? "Memuat data user..."
                  : loading
                  ? "Membuat transaksi..."
                  : "Bayar Sekarang"}
              </button>
            </form>
          </div>

          {/* ===== KANAN: Detail Psikolog ===== */}
          {drName && (
            <div className="pr-10 flex-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-full">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  Detail Psikolog
                </h2>

                {loadingDoctor ? (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-sm text-slate-400">
                      Memuat detail psikolog...
                    </p>
                  </div>
                ) : !doctor ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                    <p className="text-sm">Data psikolog tidak ditemukan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Nama & Kontak */}
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        Name :
                      </label>
                      <p className="text-base font-bold text-blue-900">
                        {doctor.name}
                      </p>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 mt-5">
                        Email :
                      </label>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {doctor.email}
                      </p>
                      <label className="mb-1 block text-sm font-semibold text-slate-700 mt-5">
                        Phone Number :
                      </label>
                      {doctor.phoneNumber && (
                        <p className="text-sm text-slate-500 mt-0.5">
                          📞 {doctor.phoneNumber}
                        </p>
                      )}
                      <label className="mb-1 block text-sm font-semibold text-slate-700 mt-5">
                        Address :
                      </label>
                      {doctor.address && (
                        <p className="text-sm text-slate-500 mt-0.5">
                          📍 {doctor.address}
                        </p>
                      )}
                    </div>

                    {/* Spesialisasi */}
                    {doctor.psychiatristInfo?.specialization && (
                      <div className="rounded-lg border border-slate-200 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Spesialisasi
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                          {doctor.psychiatristInfo.specialization}
                        </p>
                      </div>
                    )}

                    {/* Pengalaman */}
                    {doctor.psychiatristInfo?.experience && (
                      <div className="rounded-lg border border-slate-200 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Pengalaman
                        </p>
                            <p className="mt-1 text-sm text-slate-800">
                              {formatExperience(doctor.psychiatristInfo.experience)}
                            </p>
                      </div>
                    )}

                    {/* Jadwal */}
                    {doctor.psychiatristInfo?.schedule && (
                      <div className="rounded-lg border border-slate-200 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Jadwal
                        </p>
                        <p className="mt-1 text-sm text-slate-800">
                          {doctor.psychiatristInfo.schedule}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
