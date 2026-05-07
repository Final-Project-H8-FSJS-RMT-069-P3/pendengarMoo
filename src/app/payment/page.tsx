import PaymentCheckoutClient from "./PaymentCheckoutClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

type PaymentPageProps = {
  searchParams: Promise<{
    amount?: string | string[];
    itemId?: string | string[];
    itemName?: string | string[];
    orderId?: string | string[];
    bookingId?: string | string[];
    drName?: string | string[];
  }>;
};

const getSingleParam = (value?: string | string[]) => {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
};

const toPositiveNumber = (value?: string) => {
  if (!value) return 0;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const session = await auth();
  const sessionRole = String(session?.user?.role || "").toLowerCase();
  if (sessionRole === "doctor" || sessionRole === "psychiatrist") {
    redirect("/bookinglist");
  }

  const params = await searchParams;

  const amount = toPositiveNumber(getSingleParam(params.amount));
  const itemId = getSingleParam(params.itemId) || "CONSULT-ONLINE";
  const itemName = getSingleParam(params.itemName) || "Konseling Online";
  const orderId = getSingleParam(params.orderId) || `ORDER-${Date.now()}`;
  const bookingId = getSingleParam(params.bookingId);
  const drName = getSingleParam(params.drName);

  return (
    <PaymentCheckoutClient
      amount={amount}
      itemId={itemId}
      itemName={itemName}
      orderId={orderId}
      bookingId={bookingId}
      drName={drName}
    />
  );
}
