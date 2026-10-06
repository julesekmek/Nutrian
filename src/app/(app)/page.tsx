import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { SegmentedLinks } from "@/components/ui/SegmentedLinks";
import { getDashboard } from "@/lib/data/dashboard";
import { getProfile } from "@/lib/data/profile";
import { formatLongDate } from "@/lib/dates";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";

export default async function TodayPage({ searchParams }: PageProps<"/">) {
  const { vue } = await searchParams;
  const view = vue === "semaine" ? "week" : "day";
  const profile = await getProfile();
  if (!profile) redirect("/onboarding");

  const dashboard = await getDashboard(profile);

  return (
    <>
      <PageHeader
        title={view === "week" ? "Ma semaine" : "Aujourd'hui"}
        subtitle={formatLongDate(dashboard.today)}
      />
      <div className="mb-section">
        <SegmentedLinks
          label="Période"
          items={[
            { href: "/", label: "Jour", active: view === "day" },
            { href: "/?vue=semaine", label: "Semaine", active: view === "week" },
          ]}
        />
      </div>
      {view === "week" ? (
        <WeekView week={dashboard.week} goal={profile.goal} today={dashboard.today} />
      ) : (
        <DayView
          summary={dashboard.todaySummary}
          remaining={dashboard.remaining}
          tips={dashboard.tips}
          meals={dashboard.meals}
        />
      )}
    </>
  );
}
