import type { Metadata } from "next";
import { signIn } from "../actions";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { erreur } = await searchParams;
  const notice =
    erreur === "lien"
      ? "Ce lien n'est plus valide. Connecte-toi ou recommence l'inscription."
      : undefined;
  return <AuthForm mode="login" action={signIn} notice={notice} />;
}
