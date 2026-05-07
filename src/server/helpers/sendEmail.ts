import { EmailTemplate, EmailTemplateProps } from "@/components/EmailTemplate";
// `resend` is optional in dev. Don't throw at module import time — lazily create
// the Resend client inside the function or skip sending if API key missing.
let ResendClient: any = null;
try {
  // import only when needed to avoid throwing during module load in dev
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Resend } = require("resend");
  ResendClient = Resend;
} catch (err) {
  // Resend package might be absent in some dev setups; we'll handle gracefully
  ResendClient = null;
}

// prefer full "Name <email>" in RESEND_FROM, but accept plain email
const rawFrom = process.env.RESEND_FROM ?? "";
const from = rawFrom.includes("<")
  ? rawFrom
  : rawFrom
    ? `PendengarMu <${rawFrom}>`
    : "PendengarMu <no-reply@watisdis.web.id>";

export async function SendEmail(payload: EmailTemplateProps) {
  if (payload.type === "doctor" && !payload?.doctorEmail) {
    throw new Error("Missing recipient email in SendEmail payload");
  }
  console.log("PAYLOAD:", payload);
console.log("PATIENT EMAIL:", payload.patientEmail);
  if (payload.type === "patient" && !payload?.patientEmail) {
    throw new Error("Missing recipient email in SendEmail payload");
  }
    
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !ResendClient) {
    // No API key or Resend package — skip sending in non-production/dev.
    console.warn("SendEmail skipped: RESEND_API_KEY not set or Resend client missing.");
    console.log("Email payload would be:", payload);
    return { skipped: true };
  }

  const resend = new ResendClient(apiKey);
  const to = payload.type === "doctor" ? payload.doctorEmail : payload.patientEmail;
 

  const subject = payload.type === "doctor" ? `New booking — ${payload.patientName}` : `Booking Confirmation — ${payload.doctorName}`;  
  

  try {
    const result = await resend.emails.send({
      from,
      to: [to],
      subject,
      react: EmailTemplate(payload),
    });

    // SDK may return an object with an `error` property; check safely
    if (typeof result === "object" && result !== null) {
      const resObj = result as Record<string, unknown>;
      if (resObj.error) {
        throw resObj.error;
      }
    }

    console.log("SendEmail result:", result);
    return result;
  } catch (err) {
    console.error("SendEmail error:", err);
    throw err;
  }
}
