import { log } from "console";

function formatPhone(phone: string) {
    phone = phone.replace(/\D/g, "");

    if (phone.startsWith("0")) {
        return "62" + phone.slice(1);
    }
    if (phone.startsWith("62")) {
        return phone;
    }
    if (phone.startsWith("8")) {
        return "62" + phone;
    }
    return phone;
}

export async function sendWhatsApp(phone: string, message: string) {
  try {
    const formatted = formatPhone(phone);

    log("[fonnte] sending message", { phone, message });
    log("[fonnte] formatted phone", formatted);

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_TOKEN!,
      },
      body: new URLSearchParams({
        target: formatted,
        message: message,
        countryCode: "62",
      }),
    });

    const data = await res.json();

    console.log("[fonnte] success:", {
      original: phone,
      formatted,
      response: data,
    });

    return data;
  } catch (err) {
    console.error("[fonnte] failed:", err);
    throw err;
  }
}
