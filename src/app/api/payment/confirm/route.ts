import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { getDB } from "@/server/config/mongodb";
import { ObjectId } from "mongodb";
import User from "@/server/models/User";
import UserBooking from "@/server/models/UserBooking";
import {
  createPrimaryCalendarEvent,
  isPrimaryCalendarSlotAvailable,
} from "@/server/helpers/googleCalendarOAuth";
import { SendEmail } from "@/server/helpers/sendEmail";
import { sendWhatsApp } from "@/server/helpers/sendWa";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ message: "Missing orderId" }, { status: 400 });
    }

    const db = await getDB();
    const order = await db.collection("Orders").findOne({ orderId });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Use CoreApi to check transaction status
    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: process.env.MIDTRANS_SERVER_KEY || "",
      clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    });

    let statusResp = null;
    try {
      statusResp = await core.transaction.status(orderId);
    } catch (e) {
      // If Midtrans status check fails, fallback to order.status
      console.warn("Midtrans status check failed", e);
    }

    const txStatus = statusResp?.transaction_status || order.status;

    // Consider success states
    const successStates = ["settlement", "capture", "success"];

    if (successStates.includes(txStatus)) {
      // If booking already created, just return success
      if (order.bookingId) {
        return NextResponse.json({ success: true, bookingId: order.bookingId.toString() });
      }

      // Create booking from bookingPayload
      const bookingPayload = order.bookingPayload;
      if (!bookingPayload) {
        return NextResponse.json({ message: "No booking payload on order" }, { status: 400 });
      }

      // Mark booked as paid
      bookingPayload.isPaid = true;
      bookingPayload.createdAt = new Date(bookingPayload.createdAt || Date.now());

      const insertRes = await db.collection("UserBookings").insertOne(bookingPayload);
      const newBookingId = insertRes.insertedId;

      const roomName = `room-${newBookingId.toString()}`;
      await db.collection("Rooms").insertOne({
        userId: bookingPayload.userId,
        staffId: bookingPayload.staffId,
        roomName,
        createdAt: new Date(),
      });

      // Update order
      await db.collection("Orders").updateOne({ orderId }, { $set: { bookingId: newBookingId, status: "success", updatedAt: new Date() } });

      // Try to sync Google Calendar (create event) similar to webhook flow
      try {
        const booking = await UserBooking.getBookingById(newBookingId.toString());
        const userData = await User.getUserById(booking.userId.toString());
        const doctorData = await User.getUserById(booking.staffId.toString());

        const doctorCalendar = doctorData?.googleCalendar;
        const userCalendar = userData?.googleCalendar;

        if (doctorCalendar?.refreshToken && userCalendar?.refreshToken && booking) {
          await UserBooking.updateBookingCalendarSync(newBookingId.toString(), { status: "pending" });

          const bookingStart = new Date(booking.date);
          const bookingEnd = new Date(
            bookingStart.getTime() + Math.max(15, booking.sessionDuration) * 60 * 1000,
          );

          const doctorSlotAvailable = await isPrimaryCalendarSlotAvailable(
            doctorCalendar,
            bookingStart,
            bookingEnd,
          );

          const userSlotAvailable = await isPrimaryCalendarSlotAvailable(
            userCalendar,
            bookingStart,
            bookingEnd,
          );

          if (doctorSlotAvailable && userSlotAvailable) {
            const calendarEvent = await createPrimaryCalendarEvent(doctorCalendar, {
              bookingId: newBookingId.toString(),
              startDate: bookingStart,
              durationMinutes: booking.sessionDuration,
              sessionType: booking.type,
              doctorName: doctorData?.name ?? "Doctor",
              doctorEmail: doctorData?.email,
              userName: userData?.name ?? "Patient",
              userEmail: userData?.email,
            });

            await UserBooking.updateBookingCalendarSync(newBookingId.toString(), {
              eventId: calendarEvent.eventId,
              eventLink: calendarEvent.eventLink,
              meetLink: (calendarEvent as any).meetLink,
              status: "success",
            });
          } else {
            await UserBooking.updateBookingCalendarSync(newBookingId.toString(), {
              status: "failed",
              error: "Calendar conflict for user or doctor",
            });
          }
        }
      } catch (err) {
        console.error("Confirm: calendar sync failed", err);
        try {
          await UserBooking.updateBookingCalendarSync(newBookingId.toString(), { status: "failed", error: (err as Error).message });
        } catch (e) {
          console.error("Failed to set calendar sync failure flag", e);
        }
      }

      // Send confirmation emails to both patient and doctor
      try {
        const finalBooking = await UserBooking.getBookingById(newBookingId.toString());
        const finalUserData = await User.getUserById(finalBooking.userId.toString());
        const finalDoctorData = await User.getUserById(finalBooking.staffId.toString());

        if (finalUserData && finalDoctorData && finalBooking) {
          const bookingDate = new Date(finalBooking.date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          const bookingTime = new Date(finalBooking.date).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const emailPayload = {
            patientEmail: finalUserData?.email ?? "",
            doctorEmail: finalDoctorData?.email ?? "",
            doctorName: finalDoctorData?.name ?? "",
            patientName: finalUserData?.name ?? "Unknown Patient",
            patientPhone: finalUserData?.phoneNumber ?? "",
            patientAddress: finalUserData?.address ?? "",
            bookingDate: bookingDate,
            bookingTime: `${bookingTime} WIB`,
            googleMeetLink: finalBooking.type === "videocall" ? finalBooking.googleMeetLink : undefined,
          };

          try {
            void SendEmail({
              type: "doctor",
              ...emailPayload,
            }).catch((err: unknown) => console.error("Failed to send booking email:", err));
            void SendEmail({
              type: "patient",
              ...emailPayload,
            }).catch((err: unknown) => console.error("Failed to send booking email:", err));
            console.log("Emails sent for booking:", newBookingId.toString());
          } catch (emailErr) {
            console.error("Failed to send booking email:", emailErr);
          }

          // Send WhatsApp messages
          if (finalUserData?.phoneNumber) {
            const waMessage = [
              "✅ *Booking Confirmed*",
              "",
              `Hi ${finalUserData.name},`,
              "",
              "Your session has been successfully scheduled:",
              "",
              `Doctor : ${finalDoctorData?.name}`,
              `Date   : ${bookingDate}`,
              `Time   : ${bookingTime} WIB`,
              `Session : ${finalBooking.type}`,
              "",
              "Please be ready on time 🙌",
            ].join("\n");

            try {
              await sendWhatsApp(finalUserData.phoneNumber, waMessage);
            } catch (err) {
              console.error("WA patient failed:", err);
            }
          }

          if (finalDoctorData?.phoneNumber) {
            const waMessage = [
              "📢 *Booking Confirmed*",
              "",
              "A booking has been confirmed.",
              "",
              `Patient : ${finalUserData?.name}`,
              `Date    : ${bookingDate}`,
              `Time    : ${bookingTime} WIB`,
              `Session : ${finalBooking.type}`,
              "Status  : *CONFIRMED*",
              "",
              "Please prepare accordingly.",
            ].join("\n");

            try {
              await sendWhatsApp(finalDoctorData.phoneNumber, waMessage);
            } catch (err) {
              console.error("WA doctor failed:", err);
            }
          }
        }
      } catch (emailErr) {
        console.error("Confirm: email sending failed", emailErr);
      }

      return NextResponse.json({ success: true, bookingId: newBookingId.toString() });
    }

    // Not successful yet - mark failed and return status
    await db.collection("Orders").updateOne({ orderId }, { $set: { status: "failed", updatedAt: new Date() } });
    return NextResponse.json({ success: false, status: txStatus });
  } catch (error) {
    console.error("Payment confirm error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
