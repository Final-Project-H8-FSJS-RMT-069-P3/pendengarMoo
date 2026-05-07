import { SendEmail } from "@/server/helpers/sendEmail";
import type { EmailTemplateProps } from "@/components/EmailTemplate";
import UserModel from "../../../server/models/User";
import BookingModel from "../../../server/models/UserBooking";
import type { Model, Document, Types } from "mongoose";

interface IUserDoc extends Document {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface IBookingDoc extends Document {
  _id: Types.ObjectId;
  doctorId: string;
  patientId: string;
  date: string | Date;
  time: string;
  notes?: string;
  priceTier?: string;
}

interface EmailBookingBody {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  notes?: string;
}

const User = UserModel as unknown as Model<IUserDoc>;
const Booking = BookingModel as unknown as Model<IBookingDoc>;

export async function POST(req: Request) {
  console.log("[api/email-bookings] POST invoked");
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch (err) {
    console.error("[api/email-bookings] invalid JSON", err);
    return new Response(JSON.stringify({ message: "Invalid JSON" }), {
      status: 400,
    });
  }

  console.log("[api/email-bookings] raw body:", rawBody);

  const isEmailBookingBody = (x: unknown): x is EmailBookingBody => {
    if (typeof x !== "object" || x === null) return false;
    const r = x as Record<string, unknown>;
    return (
      typeof r.doctorId === "string" &&
      typeof r.patientId === "string" &&
      typeof r.date === "string" &&
      typeof r.time === "string"
    );
  };

  if (!isEmailBookingBody(rawBody)) {
    console.error("[api/email-bookings] invalid body shape");
    return new Response(JSON.stringify({ message: "Invalid request body" }), {
      status: 400,
    });
  }

  const { doctorId, patientId, date, time, notes } = rawBody;

  if (!doctorId || !patientId || !date || !time) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 },
    );
  }

  const doctor = await User.findById(doctorId);
  const patient = await User.findById(patientId);

  console.log("[email-bookings] doctor from DB:", {
    id: doctorId,
    email: doctor?.email,
  });
  console.log("[email-bookings] patient from DB:", {
    id: patientId,
    email: patient?.email,
  });

  if (!doctor || !patient) {
    return new Response(
      JSON.stringify({ message: "Doctor or patient not found" }),
      { status: 404 },
    );
  }

  const booking = (await Booking.create({
    doctorId,
    patientId,
    date: date,
    time: time,
    notes: notes,
  })) as IBookingDoc;

  console.log("[booking] created", {
    bookingId: booking._id?.toString?.(),
    doctorId,
    patientId,
    date,
    time,
  });

  const emailPayload: EmailTemplateProps = {
    type: "doctor",
    doctorEmail: doctor.email ?? "",
    patientEmail: patient.email ?? "",
    doctorName: doctor.name,
    patientName: patient.name ?? "Unknown",
    patientPhone: patient.phone ?? "-",
    patientAddress: patient.address ?? "-",
    bookingDate: booking.date
      ? new Date(booking.date).toString()
      : new Date(date).toString(),
    bookingTime: booking.time ?? time,
    priceTier: booking.priceTier ?? "Standard",
    notes: booking.notes ?? notes,
  };

  // send email without blocking response
  void SendEmail(emailPayload)
    .then(() =>
      console.log("[email-bookings] email sent to", emailPayload.doctorEmail),
    )
    .catch((err) =>
      console.error("[email-bookings] failed to send email:", err),
    );

  return new Response(JSON.stringify({ message: "Booking successful" }), {
    status: 200,
  });
}
