import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-content flex-col justify-center px-gutter">
      <EmptyState
        icon="search"
        title="Page introuvable"
        description="Ce contenu n'existe pas ou plus."
        action={<ButtonLink href="/">Revenir à l&apos;accueil</ButtonLink>}
      />
    </main>
  );
}
