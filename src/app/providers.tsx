"use client";

import { SessionProvider } from "next-auth/react";
import ChatAssistantWidget from "@/components/ChatAssistantWidget";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {children}
      <ChatAssistantWidget />
    </SessionProvider>
  );
}