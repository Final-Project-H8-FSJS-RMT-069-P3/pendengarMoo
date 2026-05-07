"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentLoadingPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [queryResolved, setQueryResolved] = useState(false);
  const [status, setStatus] = useState("checking");
  const [statusMessage, setStatusMessage] = useState("Please wait while we verify your payment...");

  useEffect(() => {
    try {
      const p = new URL(window.location.href).searchParams;
      setOrderId(p.get("orderId") || p.get("order_id"));
    } catch (e) {
      setOrderId(null);
    } finally {
      setQueryResolved(true);
    }
  }, []);

  useEffect(() => {
    if (!queryResolved) {
      return;
    }

    if (!orderId) {
      setStatus("missing");
      setTimeout(() => router.push("/bookinglist"), 2000);
      return;
    }

    let cancelled = false;

    async function checkUntilReady() {
      const maxChecks = 20;
      const delayMs = 1500;

      for (let attempt = 1; attempt <= maxChecks; attempt++) {
        if (cancelled) return;

        setStatusMessage(`Syncing payment and booking data (${attempt}/${maxChecks})...`);

        let res: Response;
        let data: any;

        try {
          res = await fetch("/api/payment/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
          data = await res.json();
        } catch (err) {
          console.error(err);
          if (attempt === maxChecks) {
            setStatus("error");
            setTimeout(() => router.replace("/bookinglist"), 2200);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        if (data?.success) {
          if (!cancelled) router.replace("/bookinglist");
          return;
        }

        const pendingStatuses = ["pending", "processing", "challenge", "authorize"];
        const isStillProcessing =
          res.status === 202 ||
          pendingStatuses.includes(String(data?.status || "").toLowerCase()) ||
          data?.message === "Order not found";

        if (isStillProcessing && attempt < maxChecks) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        if (isStillProcessing) {
          setStatus("checking");
          setStatusMessage("Payment is still pending in Midtrans. Complete the payment first, then reopen this page.");
          return;
        }

        setStatus("failed");
        setTimeout(() => router.replace("/bookinglist"), 2200);
        return;
      }

      setStatus("failed");
      setTimeout(() => router.replace("/bookinglist"), 2200);
    }

    void checkUntilReady();

    return () => {
      cancelled = true;
    };
  }, [orderId, queryResolved, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        {status === "checking" && (
          <div className="flex flex-col items-center gap-6">
            <svg
              className="w-16 h-16 text-blue-600 animate-spin"
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
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Processing Payment</h2>
              <p className="text-sm text-slate-500 mt-2">{statusMessage}</p>
            </div>
          </div>
        )}
        {status === "failed" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
              <p className="text-sm text-slate-500 mt-2">Redirecting you back...</p>
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-600">Error Occurred</h2>
              <p className="text-sm text-slate-500 mt-2">Unable to verify payment. Redirecting...</p>
            </div>
          </div>
        )}
        {status === "missing" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-yellow-600">No Order Found</h2>
              <p className="text-sm text-slate-500 mt-2">Redirecting you back...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
