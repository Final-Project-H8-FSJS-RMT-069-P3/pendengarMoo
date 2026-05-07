"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface Doctor {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  address: string;
  psychiatristInfo?: {
    paket?: { type: "videocall" | "chat-only" | "offline"; price: number }[];
    imageUrl?: string;
    about?: string;
    speciality?: string[];
    experience?: number;
    certificate?: string;
    scheduleDays?: string[];
    scheduleTimes?: string[];
  };
}

interface BookingFormProps {
  staffId: string;
}

export default function BookingForm({ staffId }: BookingFormProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(staffId);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionDuration] = useState("50");
  const [sessionType, setSessionType] = useState<"chat" | "video" | "offline">(
    "chat",
  );
  const [amount, setAmount] = useState("120000");
  const [bookedStarts, setBookedStarts] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch("/api/getdoctors");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch doctors");
        setDoctors(data.data);
        if (!selectedDoctorId && data.data.length > 0) {
          setSelectedDoctorId(data.data[0]._id);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
    fetchDoctors();
  }, [selectedDoctorId]);

  useEffect(() => {
    const selected = doctors.find((d) => d._id === selectedDoctorId);
    const mapType =
      sessionType === "video"
        ? "videocall"
        : sessionType === "chat"
          ? "chat-only"
          : "offline";
    const price = selected?.psychiatristInfo?.paket?.find(
      (p) => p.type === mapType,
    )?.price;
    if (price !== undefined) {
      setAmount(String(price));
    } else {
      setAmount("");
    }
  }, [sessionType, selectedDoctorId, doctors]);

  useEffect(() => {
    const handler = setTimeout(() => {
      async function fetchBooked() {
        setBookedStarts([]);
        if (!selectedDoctorId || !selectedDate) return;
        try {
          const res = await fetch(
            `/api/getbookings?staffId=${selectedDoctorId}&date=${selectedDate}`,
          );
          const json = await res.json();
          if (!res.ok)
            throw new Error(json.message || "Failed to fetch bookings");
          const starts: string[] = json.data.map((b: { date: string }) => {
            const d = new Date(b.date);
            const hh = d.getHours().toString().padStart(2, "0");
            const mm = d.getMinutes().toString().padStart(2, "0");
            return `${hh}:${mm}`;
          });
          setBookedStarts(starts);
        } catch (err: unknown) {
          console.error("fetchBooked error", err);
        }
      }
      void fetchBooked();
    }, 300);
    return () => clearTimeout(handler);
  }, [selectedDoctorId, selectedDate]);

  useEffect(() => {
    if (!selectedTime) return;
    const start = selectedTime.split(" - ")[0];
    if (bookedStarts.includes(start)) {
      setSelectedTime("");
    }
  }, [bookedStarts, selectedTime]);

  const mapOptionToPaketType = (opt: "chat" | "video" | "offline") =>
    opt === "video" ? "videocall" : opt === "chat" ? "chat-only" : "offline";

  const formatRp = (n?: number) =>
    n === undefined ? "-" : n.toLocaleString("id-ID");

  const paketTypes = ["videocall", "chat-only", "offline"] as const;
  const anyPaketAvailable = (() => {
    const sel = doctors.find((d) => d._id === selectedDoctorId);
    const arr = sel?.psychiatristInfo?.paket ?? [];
    return paketTypes.some((t) => arr.find((p) => p.type === t));
  })();

  const selectedDoctor = doctors.find((d) => d._id === selectedDoctorId);

  async function handleBooking(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!selectedDate) {
      setError("Pilih tanggal sesi terlebih dahulu.");
      setIsLoading(false);
      return;
    }
    if (!selectedTime) {
      setError("Pilih jam sesi terlebih dahulu.");
      setIsLoading(false);
      return;
    }
    if (!amount) {
      setError("Harga paket tidak tersedia untuk dokter ini.");
      setIsLoading(false);
      return;
    }

    const startTime = selectedTime.split(" - ")[0];
    const combinedDate = new Date(
      `${selectedDate}T${startTime}:00`,
    ).toISOString();

    const mapType: "videocall" | "chat-only" | "offline" =
      sessionType === "video"
        ? "videocall"
        : sessionType === "chat"
          ? "chat-only"
          : "offline";
    const hasPaket = selectedDoctor?.psychiatristInfo?.paket?.some(
      (p) => p.type === mapType,
    );
    if (!hasPaket) {
      setError("Tipe sesi yang dipilih tidak tersedia untuk dokter ini.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          staffId: selectedDoctorId,
          date: combinedDate,
          sessionDuration,
          amount,
          sessionType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Gagal membuat booking");
        setIsLoading(false);
        return;
      }

      location.href = data.redirect_url;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Unauthorized"))
        router.push("/login");
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full mx-auto p-10 bg-white rounded-2xl shadow-lg border border-gray-100 mt-10">
      <h2 className="text-2xl font-black text-blue-900 mb-6 tracking-tight">
        Booking Sesi Konsultasi
      </h2>

      <div className="mb-6">
        <label className="mb-1 text-sm font-semibold text-blue-900">
          Pilih Psikolog
        </label>
        <select
          value={selectedDoctorId}
          onChange={(e) => setSelectedDoctorId(e.target.value)}
          className="w-full p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-blue-900 font-medium"
        >
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleBooking} className="space-y-6">
        <div className="flex flex-col">
          <label
            htmlFor="date"
            className="mb-1 text-sm font-semibold text-blue-900"
          >
            Tanggal
          </label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            className="p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-blue-50 text-blue-900 font-medium"
          />
        </div>

        {selectedDate && (
          <div className="flex flex-col">
            <span className="mb-1 text-sm font-semibold text-blue-900">
              Jam Sesi
            </span>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {[
                "09:00 - 09:50",
                "10:00 - 10:50",
                "11:00 - 11:50",
                "12:00 - 12:50",
                "13:00 - 13:50",
                "14:00 - 14:50",
                "15:00 - 15:50",
                "16:00 - 16:50",
              ].map((time) => {
                const start = time.split(" - ")[0];
                const isBooked = bookedStarts.includes(start);
                const scheduleDays =
                  selectedDoctor?.psychiatristInfo?.scheduleDays || [];
                const scheduleTimes =
                  selectedDoctor?.psychiatristInfo?.scheduleTimes || [];
                const weekdayName = selectedDate
                  ? new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                    })
                  : "";
                const dayAllowed =
                  !scheduleDays ||
                  scheduleDays.length === 0 ||
                  scheduleDays.includes(weekdayName);
                const timeAllowed =
                  !scheduleTimes ||
                  scheduleTimes.length === 0 ||
                  scheduleTimes.includes(start);
                const isUnavailable = isBooked || !dayAllowed || !timeAllowed;

                return (
                  <label key={time} className="relative group">
                    <input
                      type="radio"
                      name="sessionTime"
                      value={time}
                      checked={selectedTime === time}
                      onChange={() => setSelectedTime(time)}
                      required
                      disabled={isUnavailable}
                      className="peer appearance-none absolute w-0 h-0 opacity-0"
                    />
                    <span
                      className={
                        `inline-flex w-full h-9 items-center justify-center rounded-lg border border-blue-500 font-semibold cursor-pointer transition-colors text-sm ` +
                        (isUnavailable
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : selectedTime === time
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white text-blue-600 hover:bg-blue-100")
                      }
                      title={isUnavailable ? "Unavailable" : ""}
                    >
                      <span className="text-center">{time}</span>
                    </span>
                    {isUnavailable && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-gray-700 text-white rounded opacity-0 pointer-events-none transition-opacity group-hover:opacity-100">
                        Unavailable
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-blue-900">Tipe Sesi</span>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: "Chat", value: "chat" },
              { label: "Video", value: "video" },
              { label: "Offline", value: "offline" },
            ].map((option) => {
              const mapType = mapOptionToPaketType(
                option.value as "chat" | "video" | "offline",
              );
              const price = doctors
                .find((d) => d._id === selectedDoctorId)
                ?.psychiatristInfo?.paket?.find(
                  (p) => p.type === mapType,
                )?.price;
              const isAvailable = price !== undefined;
              return (
                <label key={option.value} className="relative">
                  <input
                    type="radio"
                    name="sessionType"
                    value={option.value}
                    checked={sessionType === option.value}
                    onChange={() =>
                      setSessionType(
                        option.value as "chat" | "video" | "offline",
                      )
                    }
                    className="peer appearance-none absolute w-0 h-0 opacity-0"
                    disabled={!isAvailable}
                  />
                  <span
                    className={
                      `inline-flex w-full h-9 items-center justify-center rounded-lg border border-orange-500 font-semibold cursor-pointer transition-colors text-sm ` +
                      (isAvailable
                        ? sessionType === option.value
                          ? "bg-orange-500 text-white shadow-lg"
                          : "bg-white text-orange-500 hover:bg-orange-100"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed")
                    }
                    title={
                      isAvailable ? `Rp ${formatRp(price)}` : "Tidak tersedia"
                    }
                  >
                    <span className="text-center">{option.label}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-blue-700">
            Total Pembayaran
          </span>
          <span className="text-xl font-black text-blue-900">
            {amount ? `Rp ${Number(amount).toLocaleString("id-ID")}` : "–"}
          </span>
        </div>
        {!anyPaketAvailable && (
          <p className="text-sm text-red-600 font-semibold">
            Harga paket tidak tersedia untuk dokter ini.
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !anyPaketAvailable || !amount}
          className={`w-full py-3 px-4 rounded-xl text-white font-black text-lg transition-colors shadow-sm ${
            isLoading || !anyPaketAvailable || !amount
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Memproses..." : "Booking Sekarang"}
        </button>
      </form>
    </div>
  );
}
