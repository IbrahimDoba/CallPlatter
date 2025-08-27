"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { SocketProvider } from "./providers/socket-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        {children}
        <Toaster />
      </SocketProvider>
    </SessionProvider>
  );
}
