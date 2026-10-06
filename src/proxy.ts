import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";

const PUBLIC_PATHS = ["/login", "/signup", "/auth"];
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Rafraîchit la session Supabase à chaque requête et protège les routes :
 * sans session, toute page hors connexion/inscription renvoie vers /login.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isAuthenticated && !isPublic) {
    return redirectKeepingCookies(request, response, "/login");
  }
  if (isAuthenticated && AUTH_PAGES.includes(pathname)) {
    return redirectKeepingCookies(request, response, "/");
  }
  return response;
}

function redirectKeepingCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const target = request.nextUrl.clone();
  target.pathname = pathname;
  target.search = "";
  const redirect = NextResponse.redirect(target);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icons/|manifest.webmanifest|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
