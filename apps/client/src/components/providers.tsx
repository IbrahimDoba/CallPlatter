"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { SocketProvider } from "./providers/socket-provider";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SocketProvider>
          {children}
          <Toaster />
        </SocketProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
