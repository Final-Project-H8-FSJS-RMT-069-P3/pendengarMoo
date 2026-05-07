import { Metadata } from "next";
import Link from "next/link";
import BookingForm from "../../components/BookingForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Booking Form",
  description: "Book your appointment",
};

type BookPageProps = {
  searchParams: Promise<{
    staffId?: string | string[];
  }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const doctorId = Array.isArray(params.staffId)
    ? params.staffId[0]
    : params.staffId;

  if (!doctorId) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-bold mb-2">Book an Appointment</h1>
        <p className="text-gray-600 mb-4">
          Please choose a doctor from the list first.
        </p>
        <Link
          href="/listpsikolog"
          className="text-blue-600 font-semibold hover:underline"
        >
          Back to doctor list
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9ff] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="w-full">
          <BookingForm staffId={doctorId} />
        </div>
      </div>
    </main>
  );
}
