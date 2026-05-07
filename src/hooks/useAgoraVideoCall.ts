// src/hooks/useAgoraVideoCall.ts
//
// Semua logic Agora RTC ada di sini.
// Dipanggil dari src/app/videocall/page.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "error"
  | "ended";

export interface AgoraState {
  connectionState: ConnectionState;
  localVideoTrack: ICameraVideoTrack | null;
  localAudioTrack: IMicrophoneAudioTrack | null;
  remoteVideoTrack: IRemoteVideoTrack | null;
  remoteAudioTrack: IRemoteAudioTrack | null;
  isMicOn: boolean;
  isCamOn: boolean;
  isRemoteSpeaking: boolean;
  isRecording: boolean;
  error: string | null;
}

// Helper: semua request ke /api/video/token pakai action
async function callVideoAPI(
  action: string,
  payload: Record<string, unknown> = {}
) {
  const res = await fetch("/api/video/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal menghubungi server");
  return data;
}

export function useAgoraVideoCall({
  channelName,
  onEnded,
  rtcEnabled = true,
}: {
  channelName: string;
  onEnded?: () => void;
  rtcEnabled?: boolean;
}) {
  // If RTC is disabled (chat-only mode), return a dummy no-op implementation
  if (!rtcEnabled) {
    const noop = async () => {};
    return {
      connectionState: "idle" as ConnectionState,
      localVideoTrack: null,
      localAudioTrack: null,
      remoteVideoTrack: null,
      remoteAudioTrack: null,
      isMicOn: false,
      isCamOn: false,
      isRemoteSpeaking: false,
      isRecording: false,
      error: null as string | null,
      join: noop,
      leave: noop,
      toggleMic: noop,
      toggleCam: noop,
      toggleRecording: noop,
    };
  }
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [state, setState] = useState<AgoraState>({
    connectionState: "idle",
    localVideoTrack: null,
    localAudioTrack: null,
    remoteVideoTrack: null,
    remoteAudioTrack: null,
    isMicOn: true,
    isCamOn: true,
    isRemoteSpeaking: false,
    isRecording: false,
    error: null,
  });

  // ── JOIN ────────────────────────────────────────────────────────
  const join = useCallback(async () => {
    if (!channelName) return;
    setState((s) => ({ ...s, connectionState: "connecting", error: null }));

    try {
      const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");

      const { token, appId, uid } = await callVideoAPI("join", {
        channelName,
      });

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      // Remote user publish video/audio
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setState((s) => ({
            ...s,
            remoteVideoTrack: user.videoTrack ?? null,
          }));
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
          setState((s) => ({
            ...s,
            remoteAudioTrack: user.audioTrack ?? null,
          }));
        }
      });

      // Remote user matikan perangkat
      client.on("user-unpublished", (_, mediaType) => {
        if (mediaType === "video")
          setState((s) => ({ ...s, remoteVideoTrack: null }));
        if (mediaType === "audio")
          setState((s) => ({ ...s, remoteAudioTrack: null }));
      });

      // Remote user keluar
      client.on("user-left", () => {
        setState((s) => ({
          ...s,
          remoteVideoTrack: null,
          remoteAudioTrack: null,
          isRemoteSpeaking: false,
        }));
      });

      // Deteksi siapa yang sedang bicara
      client.on("volume-indicator", (volumes) => {
        const isSpeaking = volumes
          .filter((v) => v.uid !== uid)
          .some((v) => v.level > 5);
        setState((s) => ({ ...s, isRemoteSpeaking: isSpeaking }));
      });

      client.enableAudioVolumeIndicator();

      await client.join(appId, channelName, token, uid);

      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks(
          { AEC: true, ANS: true, AGC: true },
          { encoderConfig: "720p_1" }
        );

      await client.publish([audioTrack, videoTrack]);

      setState((s) => ({
        ...s,
        connectionState: "connected",
        localAudioTrack: audioTrack,
        localVideoTrack: videoTrack,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal terhubung ke sesi video";
      console.error("Agora join error:", err);
      setState((s) => ({ ...s, connectionState: "error", error: message }));
    }
  }, [channelName]);

  // ── LEAVE ───────────────────────────────────────────────────────
  const leave = useCallback(async () => {
    state.localAudioTrack?.close();
    state.localVideoTrack?.close();
    await clientRef.current?.leave();
    clientRef.current = null;

    // Tandai sesi selesai di UserBookings
    await callVideoAPI("end-room", { channelName }).catch(() => {});

    setState((s) => ({
      ...s,
      connectionState: "ended",
      localVideoTrack: null,
      localAudioTrack: null,
      remoteVideoTrack: null,
      remoteAudioTrack: null,
    }));

    onEnded?.();
  }, [channelName, state.localAudioTrack, state.localVideoTrack, onEnded]);

  // ── TOGGLE MIC ──────────────────────────────────────────────────
  const toggleMic = useCallback(async () => {
    if (!state.localAudioTrack) return;
    const next = !state.isMicOn;
    await state.localAudioTrack.setEnabled(next);
    setState((s) => ({ ...s, isMicOn: next }));
  }, [state.localAudioTrack, state.isMicOn]);

  // ── TOGGLE CAM ──────────────────────────────────────────────────
  const toggleCam = useCallback(async () => {
    if (!state.localVideoTrack) return;
    const next = !state.isCamOn;
    await state.localVideoTrack.setEnabled(next);
    setState((s) => ({ ...s, isCamOn: next }));
  }, [state.localVideoTrack, state.isCamOn]);

  // ── TOGGLE RECORDING ────────────────────────────────────────────
  const toggleRecording = useCallback(async () => {
    if (state.isRecording) {
      mediaRecorderRef.current?.stop();
      setState((s) => ({ ...s, isRecording: false }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sesi_${channelName}_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setState((s) => ({ ...s, isRecording: true }));
    } catch (err) {
      console.error("Recording error:", err);
    }
  }, [state.isRecording, channelName]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      state.localAudioTrack?.close();
      state.localVideoTrack?.close();
      clientRef.current?.leave().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...state, join, leave, toggleMic, toggleCam, toggleRecording };
}
