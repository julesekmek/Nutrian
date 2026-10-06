import { PageHeader } from "@/components/layout/PageHeader";
import { TargetSummary } from "@/components/TargetSummary";
import { Card, CardHeader } from "@/components/ui/Card";
import { computeDayPlan } from "@/lib/calculations";
import { getProfile } from "@/lib/data/profile";
import { currentYear } from "@/lib/dates";

export default async function TodayPage() {
  const profile = await getProfile();
  if (!profile) return null;
  const plan = computeDayPlan(profile, currentYear());
  return (
    <>
      <PageHeader title="Aujourd'hui" />
      <Card>
        <CardHeader title="Ta cible du jour" subtitle="Estimation" />
        <TargetSummary targets={plan.targets} />
      </Card>
    </>
  );
}
