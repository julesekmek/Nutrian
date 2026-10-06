import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Lien de confirmation d'e-mail Supabase : ouvre la session puis envoie vers l'onboarding. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const supabase = await createSupabaseServerClient();

  let confirmed = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    confirmed = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    confirmed = !error;
  }

  const target = request.nextUrl.clone();
  target.search = "";
  target.pathname = confirmed ? "/onboarding" : "/login";
  if (!confirmed) target.searchParams.set("erreur", "lien");
  return NextResponse.redirect(target);
}
