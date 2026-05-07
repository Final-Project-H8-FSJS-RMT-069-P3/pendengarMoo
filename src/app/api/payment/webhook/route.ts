import { NextRequest, NextResponse } from "next/server";
import Order from "@/server/models/Order";
import UserBooking from "@/server/models/UserBooking";
import User from "@/server/models/User";
import { sendWhatsApp } from "@/server/helpers/sendWa";
import { SendEmail } from "@/server/helpers/sendEmail";
import {
  createPrimaryCalendarEvent,
  isPrimaryCalendarSlotAvailable,
} from "@/server/helpers/googleCalendarOAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { transaction_status, order_id, fraud_status } = body;

    console.log("Webhook received:", {
      transaction_status,
      order_id,
      fraud_status,
    });

    let orderStatus: "pending" | "success" | "failed" = "pending";

    if (transaction_status === "capture") {
      if (fraud_status === "accept") {
        orderStatus = "success";
      }
    } else if (transaction_status === "settlement") {
      orderStatus = "success";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      orderStatus = "failed";
    } else if (transaction_status === "pending") {
      orderStatus = "pending";
    }

    await Order.updateOrderStatus(order_id, orderStatus);

    if (orderStatus === "success") {
      const order = await Order.getOrderById(order_id);
      console.log("[webhook] Order retrieved:", { orderId: order_id, bookingId: order?.bookingId });

      if (!order?.bookingId) {
        console.error("[webhook] No booking ID found in order:", order_id);
        return NextResponse.json(
          { message: "Booking not found" },
          { status: 404 },
        );
      }
      console.log("[WEBHOOK ORDER_ID RAW]", order_id);

      const booking = await UserBooking.getBookingById(order.bookingId.toString());

console.log("[WEBHOOK ORDER RESULT]", order);
      console.log("[webhook] Booking retrieved:", { bookingId: order.bookingId, isPaid: booking?.isPaid });

      if (!booking) {
        console.error("[webhook] Booking not found:", order.bookingId);
        return NextResponse.json(
          { message: "Booking not found" },
          { status: 404 },
        );
      }

      const wasAlreadyPaid = booking.isPaid;

      if (!wasAlreadyPaid) {
        console.log("[webhook] Updating booking payment status to true:", order.bookingId);
        await UserBooking.updateBookingPaymentStatus(
          order.bookingId.toString(),
          true,
        );
        console.log("[webhook] Booking payment status updated successfully:", order.bookingId);
      } else {
        console.log("[webhook] Booking already paid, skipping payment status update:", order.bookingId);
      }

      const userData = await User.getUserById(booking.userId.toString());
      const doctorData = await User.getUserById(booking.staffId.toString());

      // Verify the update was successful
      const updatedBooking = await UserBooking.getBookingById(order.bookingId.toString());
      if (updatedBooking?.isPaid) {
        console.log("[webhook] ✓ Payment status confirmed in database:", {
          bookingId: order.bookingId,
          isPaid: updatedBooking.isPaid,
        });
      } else {
        console.error("[webhook] ✗ Payment status update verification failed:", {
          bookingId: order.bookingId,
          isPaid: updatedBooking?.isPaid,
        });
      }

      if (!updatedBooking?.googleCalendarEventId) {
        await UserBooking.updateBookingCalendarSync(order.bookingId.toString(), {
          status: "pending",
        });

        try {
          const doctorCalendar = doctorData?.googleCalendar;
          const userCalendar = userData?.googleCalendar;

          if (!doctorCalendar?.refreshToken || !userCalendar?.refreshToken) {
            throw new Error("Both doctor and user must connect Google Calendar first");
          }

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

          if (!doctorSlotAvailable || !userSlotAvailable) {
            throw new Error(
              "Google Calendar conflict: selected time is already busy for doctor or patient",
            );
          }

          const calendarEvent = await createPrimaryCalendarEvent(doctorCalendar, {
            bookingId: order.bookingId.toString(),
            startDate: bookingStart,
            durationMinutes: booking.sessionDuration,
            sessionType: booking.type,
            doctorName: doctorData?.name ?? "Doctor",
            doctorEmail: doctorData?.email,
            userName: userData?.name ?? "Patient",
            userEmail: userData?.email,
          });

          await UserBooking.updateBookingCalendarSync(order.bookingId.toString(), {
            eventId: calendarEvent.eventId,
            eventLink: calendarEvent.eventLink,
            meetLink: (calendarEvent as any).meetLink,
            status: "success",
          });

          console.log("[webhook] Google Calendar synced:", {
            bookingId: order.bookingId,
            eventId: calendarEvent.eventId,
          });
        } catch (calendarErr: unknown) {
          const calendarErrorMessage =
            calendarErr instanceof Error ? calendarErr.message : "Unknown calendar sync error";

          await UserBooking.updateBookingCalendarSync(order.bookingId.toString(), {
            status: "failed",
            error: calendarErrorMessage,
          });

          console.error("[webhook] Google Calendar sync failed:", {
            bookingId: order.bookingId,
            error: calendarErrorMessage,
          });
        }
      } else {
        console.log("[webhook] Calendar event already exists, skipping calendar sync:", {
          bookingId: order.bookingId,
          eventId: updatedBooking.googleCalendarEventId,
        });
      }
  

      const bookingDate = new Date(booking.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const bookingTime = new Date(booking.date).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const emailPayload = {
        patientEmail: userData?.email ?? "",
        doctorEmail: doctorData?.email ?? "",
        doctorName: doctorData?.name ?? "",
        patientName: userData?.name ?? "Unknown Patient",
        patientPhone: userData?.phoneNumber ?? "",
        patientAddress: userData?.address ?? "",
        bookingDate: bookingDate,
        bookingTime: `${bookingTime} WIB`,
      };

      if (!wasAlreadyPaid) {
        try {
          void SendEmail({
            type: "doctor",
            ...emailPayload,
          }).catch((err: unknown) => console.error("Failed to send booking email:", err));
          void SendEmail({
            type: "patient",
            ...emailPayload,
          }).catch((err: unknown) => console.error("Failed to send booking email:", err));
          console.log("Email sent");
        } catch (emailErr) {
          console.error("Failed to send booking email:", emailErr);
        }

        if (userData?.phoneNumber) {
          const waMessage = [
            "✅ *Booking Confirmed*",
            "",
            `Hi ${userData.name},`,
            "",
            "Your session has been successfully scheduled:",
            "",
            `Doctor : ${doctorData?.name}`,
            `Date   : ${bookingDate}`,
            `Time   : ${bookingTime} WIB`,
            `Session : ${booking.type}`,

            "",
            "Please be ready on time 🙌",
          ].join("\n");

          try {
            await sendWhatsApp(userData.phoneNumber, waMessage);
          } catch (err) {
            console.error("WA patient failed:", err);
          }
        }

        if (doctorData?.phoneNumber) {
          const waMessage = [
            "📢 *Booking Confirmed*",
            "",
            "A booking has been confirmed.",
            "",
            `Patient : ${userData?.name}`,
            `Date    : ${bookingDate}`,
            `Time    : ${bookingTime} WIB`,
            `Session : ${booking.type}`,
            "Status  : *CONFIRMED*",
            "",
            "Please prepare accordingly.",
          ].join("\n");

          try {
            await sendWhatsApp(doctorData.phoneNumber, waMessage);
          } catch (err) {
            console.error("WA patient failed:", err);
          }
        }
      }
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process webhook",
      },
      { status: 500 },
    );
  }
}
