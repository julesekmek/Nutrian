import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="pt-safe mx-auto flex min-h-dvh w-full max-w-content flex-col justify-center px-gutter py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={64} height={64} className="mb-4 rounded-card" />
        <h1 className="text-title text-ink">Nutrian</h1>
        <p className="mt-2 text-callout text-ink-muted">
          Prépare, mange et bouge en phase avec ton objectif.
        </p>
      </div>
      {children}
    </main>
  );
}
