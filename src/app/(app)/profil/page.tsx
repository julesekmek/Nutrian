import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { TargetSummary } from "@/components/TargetSummary";
import { SubmitButton } from "@/components/ui/Button";
import { Card, CardHeader, SectionTitle } from "@/components/ui/Card";
import { requireUser } from "@/lib/auth";
import { ageFromBirthYear, computeDayPlan } from "@/lib/calculations";
import { getProfile } from "@/lib/data/profile";
import { currentYear } from "@/lib/dates";
import { signOut } from "../../(auth)/actions";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const year = currentYear();
  const plan = computeDayPlan(profile, year);

  return (
    <>
      <PageHeader title="Profil" />

      <div className="flex flex-col gap-section">
        <Card>
          <CardHeader
            title="Ta cible de base"
            subtitle="Estimée avec ton activité habituelle. Elle s'ajuste chaque jour avec tes pas et tes séances."
          />
          <TargetSummary targets={plan.targets} />
        </Card>

        <section>
          <SectionTitle>Mes informations</SectionTitle>
          <Card>
            <ProfileForm profile={profile} age={ageFromBirthYear(profile.birthYear, year)} />
          </Card>
        </section>

        <form action={signOut} className="flex flex-col gap-2">
          <p className="text-center text-footnote text-ink-muted">Connecté avec {user.email}</p>
          <SubmitButton variant="danger" size="lg" fullWidth>
            Se déconnecter
          </SubmitButton>
        </form>
      </div>
    </>
  );
}
