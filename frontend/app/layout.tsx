import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { GamificationProvider } from "@/providers/gamification-provider";
import { AppShell } from "@/components/app-shell";
import { GamificationOverlay } from "@/components/gamification/gamification-overlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReadLoot",
  description: "A vocabulary RPG for readers",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <GamificationProvider>
              <GamificationOverlay />
              <AppShell>{children}</AppShell>
            </GamificationProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
