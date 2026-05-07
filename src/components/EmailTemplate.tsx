import * as React from "react";

export interface EmailTemplateProps {
  type: "doctor" | "patient";
  doctorEmail: string;
  patientEmail: string;
  doctorName?: string;
  patientName: string;
  patientPhone?: string;
  patientAddress?: string;
  bookingDate: string;
  bookingTime?: string;
  priceTier?: string;
  notes?: string;
  googleMeetLink?: string;
}

export function EmailTemplate(props: EmailTemplateProps) {
  const {
    type,
    doctorName,
    doctorEmail,
    patientName,
    patientPhone,
    patientAddress,
    bookingDate,
    bookingTime,
    priceTier,
    notes,
    googleMeetLink,
  } = props;
  const isDoctor = type === "doctor";

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#111",
        lineHeight: 1.6,
        maxWidth: 520,
      }}
    >
      {/* Greeting */}
      <p>{isDoctor ? `${doctorName},` : `Dear ${patientName},`}</p>

      {/* Intro */}
      <p>
        {isDoctor
          ? "You have received a new booking with the following details:"
          : "Your booking has been successfully created with the following details:"}
      </p>

      {/* Patient Info */}
      {!isDoctor && (
        <p>
          <strong>Patient Information</strong>
          <br />
          Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {patientName}
          <br />
          Phone&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {patientPhone ?? "-"}
          <br />
          Address&nbsp;&nbsp;: {patientAddress ?? "-"}
        </p>
      )}

      {/* Schedule */}
      <p>
        <strong>Schedule</strong>
        <br />
        Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {bookingDate}
        <br />
        Time&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {bookingTime ?? "-"}
        <br />
        Price&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {priceTier ?? "Standard"}
      </p>

      {/* Google Meet Link */}
      {googleMeetLink && (
        <p>
          <strong>Video Call Link</strong>
          <br />
          <a href={googleMeetLink} style={{ color: "#0066cc", textDecoration: "none" }}>
            {googleMeetLink}
          </a>
        </p>
      )}

      {/* Notes */}
      {notes && (
        <p>
          <strong>Notes</strong>
          <br />
          {notes}
        </p>
      )}

      {/* Closing */}
      <p>Please check your dashboard for more details.</p>

      <p>
        Regards,
        <br />
        PendengarMu Team
      </p>

      <p style={{ fontSize: 12, color: "#666", marginTop: 30 }}>
        This email was sent automatically.
      </p>
    </div>
  );
}
