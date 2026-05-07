import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

(async () => {
  try {
    const res = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: "doctor@gmail.com", // <-- replace with the doctor's Gmail
      subject: "Resend test",
      html: "<p>Resend test message</p>",
    });
    console.log("test-resend result:", res);
  } catch (err) {
    console.error("test-resend error:", err);
  }
})();