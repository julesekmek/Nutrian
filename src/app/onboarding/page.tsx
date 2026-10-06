import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { signOut } from "../(auth)/actions";
import { getProfile } from "@/lib/data/profile";
import { currentYear } from "@/lib/dates";
import { OnboardingFlow } from "./OnboardingFlow";

export const metadata: Metadata = { title: "Bienvenue" };

export default async function OnboardingPage() {
  await requireUser();
  if (await getProfile()) redirect("/");
  return (
    <main className="pt-safe mx-auto w-full max-w-content px-gutter">
      <OnboardingFlow currentYear={currentYear()} />
      <form action={signOut} className="flex justify-center pb-6">
        <button type="submit" className="text-footnote text-ink-muted underline">
          Se déconnecter
        </button>
      </form>
    </main>
  );
}
