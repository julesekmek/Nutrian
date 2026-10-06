import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { TabBar } from "@/components/layout/TabBar";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/data/profile";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUser();
  if (!(await getProfile())) redirect("/onboarding");
  return (
    <>
      <main className="pt-safe mx-auto w-full max-w-content px-gutter pb-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom)+var(--spacing-section))]">
        {children}
      </main>
      <TabBar />
    </>
  );
}
