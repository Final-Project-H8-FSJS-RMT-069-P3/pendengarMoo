// src/app/api/video/token/route.ts
//
// Semua action video call dalam satu file:
//
//   POST → { action: "create-room", bookingId }
//          Buat roomName di UserBookings, dipanggil dari bookinglist saat user klik "Mulai Sesi"
//
//   POST → { action: "join", channelName }
//          Validasi akses + generate Agora token
//
//   POST → { action: "end-room", channelName }
//          Tandai sesi selesai (isDone: true)

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDB } from "@/server/config/mongodb";
import { RtcTokenBuilder, RtcRole } from "agora-token";
import { ObjectId } from "mongodb";
import UserBooking from "@/server/models/UserBooking";
import { nanoid } from "nanoid"; // npm install nanoid

const APP_ID = process.env.AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { message: "Field 'action' wajib diisi" },
        { status: 400 }
      );
    }

    const db = await getDB();
    const bookings = db.collection("UserBookings");

    // ───────────────────────────────────────────────────────────────
    // ACTION: create-room
    // Dipanggil dari bookinglist ketika user/dokter klik "Mulai Sesi"
    // Syarat: booking harus sudah dibayar (isPaid: true)
    // Body: { action: "create-room", bookingId: string }
    // ───────────────────────────────────────────────────────────────
    if (action === "create-room") {
      const { bookingId } = body;

      if (!bookingId) {
        return NextResponse.json(
          { message: "bookingId wajib diisi" },
          { status: 400 }
        );
      }

      if (!ObjectId.isValid(bookingId)) {
        return NextResponse.json(
          { message: "bookingId tidak valid" },
          { status: 400 }
        );
      }

      const booking = await bookings.findOne({
        _id: new ObjectId(bookingId),
      });

      if (!booking) {
        return NextResponse.json(
          { message: "Booking tidak ditemukan" },
          { status: 404 }
        );
      }

      // Hanya userId atau staffId yang boleh buat room
      const currentUserId = session.user.id;
      const isAuthorized =
        booking.userId.toString() === currentUserId ||
        booking.staffId.toString() === currentUserId;

      if (!isAuthorized) {
        return NextResponse.json(
          { message: "Anda tidak memiliki akses ke booking ini" },
          { status: 403 }
        );
      }

      // Booking harus sudah dibayar
      if (!booking.isPaid) {
        return NextResponse.json(
          { message: "Sesi belum bisa dimulai, pembayaran belum selesai" },
          { status: 400 }
        );
      }

      // Kalau roomName sudah ada, langsung kembalikan
      if (booking.roomName) {
        return NextResponse.json({ roomName: booking.roomName });
      }

      // Buat roomName baru dan simpan ke booking yang sudah ada
      const roomName = `session_${bookingId}_${nanoid(8)}`;

      await bookings.updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { roomName } }
      );

      return NextResponse.json({ roomName }, { status: 201 });
    }

    // ───────────────────────────────────────────────────────────────
    // ACTION: join
    // Dipanggil dari halaman /videocall?channel=xxx saat user klik join
    // Body: { action: "join", channelName: string }
    // ───────────────────────────────────────────────────────────────
    if (action === "join") {
      const { channelName } = body;

      if (!channelName) {
        return NextResponse.json(
          { message: "channelName wajib diisi" },
          { status: 400 }
        );
      }

      const booking = await bookings.findOne({ roomName: channelName });

      if (!booking) {
        return NextResponse.json(
          { message: "Room tidak ditemukan" },
          { status: 404 }
        );
      }

      const currentUserId = session.user.id;
      const isAuthorized =
        booking.userId.toString() === currentUserId ||
        booking.staffId.toString() === currentUserId;

      if (!isAuthorized) {
        return NextResponse.json(
          { message: "Anda tidak memiliki akses ke room ini" },
          { status: 403 }
        );
      }

      // Generate UID dari userId (Agora butuh angka)
      const uid =
        parseInt(currentUserId.replace(/\D/g, "").slice(0, 8), 10) || 0;

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600;
      const tokenExpiredTs = currentTimestamp + 3600;

      const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uid,
        RtcRole.PUBLISHER,
        tokenExpiredTs,
        privilegeExpiredTs
      );

      // Tandai bahwa user ini adalah dokter atau pasien
      const isPsychologist = booking.staffId.toString() === currentUserId;

      return NextResponse.json({
        token,
        appId: APP_ID,
        channelName,
        uid,
        isPsychologist,
      });
    }

    // ───────────────────────────────────────────────────────────────
    // ACTION: end-room
    // Dipanggil saat user klik "Akhiri Sesi"
    // Body: { action: "end-room", channelName: string }
    // ───────────────────────────────────────────────────────────────
    if (action === "end-room") {
      const { channelName } = body;

      if (!channelName) {
        return NextResponse.json(
          { message: "channelName wajib diisi" },
          { status: 400 }
        );
      }

      // Try to find booking by roomName first, then by booking _id (for chat-only flow)
      let booking = await bookings.findOne({ roomName: channelName });

      if (!booking) {
        try {
          if (ObjectId.isValid(channelName)) {
            booking = await bookings.findOne({ _id: new ObjectId(channelName) });
          }
        } catch (err) {
          // ignore
        }
      }

      if (!booking) {
        return NextResponse.json(
          { message: "Room atau booking tidak ditemukan" },
          { status: 404 }
        );
      }

      const currentUserId = session.user.id;
      const isAuthorized =
        booking.userId.toString() === currentUserId ||
        booking.staffId.toString() === currentUserId;

      if (!isAuthorized) {
        return NextResponse.json(
          { message: "Anda tidak memiliki akses" },
          { status: 403 }
        );
      }

      // Mark participant done and finalize only when both have marked done
      try {
        const result = await UserBooking.markParticipantDone(booking._id.toString(), currentUserId);
        return NextResponse.json({ message: "Sesi diperbarui", result });
      } catch (err) {
        console.error("Failed to mark participant done:", err);
        return NextResponse.json({ message: "Gagal memperbarui sesi" }, { status: 500 });
      }
    }

    // Action tidak dikenali
    return NextResponse.json(
      { message: `Action '${action}' tidak dikenali` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Video API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
