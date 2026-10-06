import type { ReactNode } from "react";
import { TabBar } from "@/components/layout/TabBar";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return (
    <>
      <main className="pt-safe mx-auto w-full max-w-content px-gutter pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom)+var(--spacing-section))]">
        {children}
      </main>
      <TabBar />
    </>
  );
}
