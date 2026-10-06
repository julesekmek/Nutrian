import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nutrian",
    template: "%s · Nutrian",
  },
  description:
    "Prépare, mange et bouge en phase avec ton objectif : chaque jour, tu sais où tu en es et quoi faire pour l'atteindre.",
  applicationName: "Nutrian",
  appleWebApp: {
    capable: true,
    title: "Nutrian",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full bg-canvas text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
