"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="md:pl-60 pb-16 md:pb-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
      </main>
    </>
  );
}
