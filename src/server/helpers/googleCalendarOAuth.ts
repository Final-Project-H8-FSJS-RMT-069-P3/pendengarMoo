import crypto from "crypto";
import { calendar_v3, google } from "googleapis";
import type { IUserGoogleCalendar } from "@/server/models/User";

const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

const DEFAULT_TIME_ZONE = process.env.GOOGLE_CALENDAR_TIMEZONE || "Asia/Jakarta";
const OAUTH_STATE_SECRET = process.env.GOOGLE_OAUTH_STATE_SECRET || process.env.AUTH_SECRET || "unsafe-dev-secret";

type OAuthState = {
  userId: string;
  returnTo: string;
  ts: number;
};

type CreateCalendarEventInput = {
  startDate: Date;
  durationMinutes: number;
  sessionType: "videocall" | "chat-only" | "offline";
  doctorName: string;
  doctorEmail?: string;
  userName: string;
  userEmail?: string;
  bookingId: string;
};

function ensureOAuthEnv(redirectUriOverride?: string) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  const redirectUri =
    redirectUriOverride ||
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    new URL("/api/calendar/callback", process.env.AUTH_URL || "http://localhost:3000").toString();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, or GOOGLE_OAUTH_REDIRECT_URI",
    );
  }

  return { clientId, clientSecret, redirectUri };
}

function encodeState(payload: OAuthState) {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json).toString("base64url");
  const signature = crypto
    .createHmac("sha256", OAUTH_STATE_SECRET)
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

function decodeState(state: string): OAuthState {
  const [body, signature] = state.split(".");

  if (!body || !signature) {
    throw new Error("Invalid OAuth state");
  }

  const expectedSignature = crypto
    .createHmac("sha256", OAUTH_STATE_SECRET)
    .update(body)
    .digest("base64url");

  if (signature !== expectedSignature) {
    throw new Error("Invalid OAuth state signature");
  }

  const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OAuthState;

  const maxAgeMs = 15 * 60 * 1000;
  if (!parsed.ts || Date.now() - parsed.ts > maxAgeMs) {
    throw new Error("OAuth state expired");
  }

  return parsed;
}

function getOAuthClient(redirectUriOverride?: string) {
  const { clientId, clientSecret, redirectUri } = ensureOAuthEnv(redirectUriOverride);
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getSessionLabel(type: CreateCalendarEventInput["sessionType"]) {
  if (type === "videocall") return "Video Call";
  if (type === "chat-only") return "Chat Only";
  return "Offline Session";
}

function isValidEmail(email?: string) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildCalendarConnectUrl(
  userId: string,
  returnTo = "/profile",
  redirectUriOverride?: string,
) {
  const oauth = getOAuthClient(redirectUriOverride);
  const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/profile";
  const state = encodeState({ userId, returnTo: safeReturnTo, ts: Date.now() });

  return oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: GOOGLE_CALENDAR_SCOPES,
    state,
  });
}

export async function exchangeCodeForCalendarTokens(
  code: string,
  state: string,
  redirectUriOverride?: string,
) {
  const oauth = getOAuthClient(redirectUriOverride);
  const parsedState = decodeState(state);

  const tokenResponse = await oauth.getToken(code);
  oauth.setCredentials(tokenResponse.tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth });
  const profile = await oauth2.userinfo.get();

  return {
    userId: parsedState.userId,
    returnTo: parsedState.returnTo,
    providerEmail: profile.data.email || undefined,
    tokens: tokenResponse.tokens,
  };
}

function calendarClientFromConnection(connection: IUserGoogleCalendar) {
  const oauth = getOAuthClient();

  oauth.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.expiryDate,
    scope: connection.scope,
    token_type: connection.tokenType,
  });

  return google.calendar({ version: "v3", auth: oauth });
}

export async function isPrimaryCalendarSlotAvailable(
  connection: IUserGoogleCalendar,
  startDate: Date,
  endDate: Date,
) {
  const calendar = calendarClientFromConnection(connection);

  const freebusy = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      timeZone: DEFAULT_TIME_ZONE,
      items: [{ id: "primary" }],
    },
  });

  const busySlots = freebusy.data.calendars?.primary?.busy || [];
  return busySlots.length === 0;
}

export async function createPrimaryCalendarEvent(
  ownerConnection: IUserGoogleCalendar,
  input: CreateCalendarEventInput,
) {
  const calendar = calendarClientFromConnection(ownerConnection);
  const endDate = new Date(
    input.startDate.getTime() + Math.max(15, input.durationMinutes) * 60 * 1000,
  );

  const attendees: calendar_v3.Schema$EventAttendee[] = [];
  if (isValidEmail(input.userEmail)) attendees.push({ email: input.userEmail });
  if (isValidEmail(input.doctorEmail)) attendees.push({ email: input.doctorEmail });

  const conferenceDataVersion = input.sessionType === "videocall" ? 1 : 0;

  const event = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: attendees.length > 0 ? "all" : "none",
    conferenceDataVersion,
    requestBody: {
      summary: `PendengarMu Session: ${input.userName} with ${input.doctorName}`,
      description: [
        `Booking ID: ${input.bookingId}`,
        `Session Type: ${getSessionLabel(input.sessionType)}`,
        "Auto-created after successful payment.",
      ].join("\n"),
      start: {
        dateTime: input.startDate.toISOString(),
        timeZone: DEFAULT_TIME_ZONE,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: DEFAULT_TIME_ZONE,
      },
      attendees,
      conferenceData:
        input.sessionType === "videocall"
          ? {
              createRequest: {
                requestId: `booking-${input.bookingId}-${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            }
          : undefined,
    },
  });

  if (!event.data.id || !event.data.htmlLink) {
    throw new Error("Google Calendar event created without id/link");
  }

  // Try to find a Meet link from known fields
  const hangoutLink = (event.data as any).hangoutLink as string | undefined;
  const entryPoints = (event.data as any).conferenceData?.entryPoints as Array<any> | undefined;
  const meetEntry = entryPoints?.find((ep) => ep.entryPointType === "video" || ep.entryPointType === "more") || entryPoints?.[0];
  const meetLink = hangoutLink || meetEntry?.uri || undefined;

  return {
    eventId: event.data.id,
    eventLink: event.data.htmlLink,
    meetLink,
  };
}
