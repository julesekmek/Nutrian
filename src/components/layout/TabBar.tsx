"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

type Tab = { href: string; label: string; icon: IconName };

const LEFT_TABS: Tab[] = [
  { href: "/", label: "Aujourd'hui", icon: "today" },
  { href: "/cuisine", label: "Cuisine", icon: "kitchen" },
];
const RIGHT_TABS: Tab[] = [
  { href: "/activite", label: "Activité", icon: "activity" },
  { href: "/profil", label: "Profil", icon: "profile" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-caption font-medium ${
        active ? "text-primary" : "text-ink-subtle"
      }`}
    >
      <Icon name={tab.icon} size={24} />
      {tab.label}
    </Link>
  );
}

/** Barre d'onglets du bas, avec le bouton d'action principal « + » au centre. */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigation principale"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-content items-end px-2">
        {LEFT_TABS.map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab.href)} />
        ))}
        <div className="flex flex-1 justify-center">
          <Link
            href="/ajouter"
            aria-label="Ajouter un repas ou une séance"
            className="-mt-5 mb-1 flex size-14 items-center justify-center rounded-full bg-primary text-primary-ink shadow-floating transition-transform active:scale-95"
          >
            <Icon name="plus" size={28} strokeWidth={2.5} />
          </Link>
        </div>
        {RIGHT_TABS.map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab.href)} />
        ))}
      </div>
    </nav>
  );
}
