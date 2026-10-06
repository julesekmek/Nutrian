import { PageHeader } from "@/components/layout/PageHeader";
import { SubmitButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { requireUser } from "@/lib/auth";
import { signOut } from "../(auth)/actions";

export default async function TodayPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="Aujourd'hui" />
      <EmptyState
        title="Bienvenue sur Nutrian"
        description={`Connecté en tant que ${user.email}.`}
        action={
          <form action={signOut}>
            <SubmitButton variant="secondary">Se déconnecter</SubmitButton>
          </form>
        }
      />
    </>
  );
}
