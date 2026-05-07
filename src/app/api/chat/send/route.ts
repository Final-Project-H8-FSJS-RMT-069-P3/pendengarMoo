/* import { NextRequest, NextResponse } from "next/server";
import Pusher from "pusher"; // Gunakan 'pusher' (tanpa -js) jika di backend murni, 
                                // tapi untuk Next.js Route Handler biasanya pakai library 'pusher' server-side.
import PusherServer from "pusher";

const pusher = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: NextRequest) {
  try {
    const { message, senderName, chatId } = await req.json();

    await pusher.trigger(chatId, "incoming-message", {
      message,
      senderName,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal kirim" }, { status: 500 });
  }
}

// tolong untk yang setup nnti variabelnya di samain aja yaa biar jalan contoh kayak !!chatId BUKAN roomId!! */

import { NextRequest, NextResponse } from "next/server";
import PusherServer from "pusher";

const getPusherEnv = () => {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster =
    process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  return { appId, key, secret, cluster };
};

const createPusher = () => {
  const { appId, key, secret, cluster } = getPusherEnv();

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  return new PusherServer({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });
};

export async function GET() {
  const { key, cluster } = getPusherEnv();

  if (!key || !cluster) {
    return NextResponse.json(
      {
        error:
          "Pusher public config is missing. Set PUSHER_KEY/PUSHER_CLUSTER or NEXT_PUBLIC_PUSHER_KEY/NEXT_PUBLIC_PUSHER_CLUSTER.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ key, cluster });
}

export async function POST(req: NextRequest) {
  try {
    const pusher = createPusher();
    if (!pusher) {
      return NextResponse.json(
        {
          error:
            "Pusher server config is missing. Set PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, and PUSHER_CLUSTER.",
        },
        { status: 500 },
      );
    }

    const body = await req.json();
    const message = body.message;
    const senderName = body.senderName;
    const senderId = body.senderId;
    const channelName = body.channelName || body.chatId;

    if (!message || !channelName) {
      return NextResponse.json(
        { error: "message and channelName are required" },
        { status: 400 },
      );
    }

    // Kirim data ke Pusher menggunakan channelName yang sama dengan Video Call
    await pusher.trigger(channelName, "incoming-message", {
      message,
      senderName,
      senderId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Gagal" }, { status: 500 });
  }
}
