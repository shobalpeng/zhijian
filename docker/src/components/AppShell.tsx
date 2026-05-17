"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

const AUTH_PATHS = ["/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <main className="mx-auto w-full max-w-lg pb-20" role="main">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
