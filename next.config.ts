import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App 100 % authentifiée : chaque page lit la session, on garde donc le rendu
  // dynamique classique (Cache Components désactivé, voir docs/DECISIONS.md).
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
