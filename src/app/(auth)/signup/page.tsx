import type { Metadata } from "next";
import { signUp } from "../actions";
import { AuthForm } from "../AuthForm";

export const metadata: Metadata = { title: "Inscription" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signUp} />;
}
