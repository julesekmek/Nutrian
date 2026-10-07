import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App 100 % authentifiée : chaque page lit la session, on garde donc le rendu
  // dynamique classique (Cache Components désactivé, voir docs/DECISIONS.md).
  poweredByHeader: false,
  turbopack: {
    // Racine explicite : évite que Next remonte jusqu'à un package-lock.json hors du projet.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
