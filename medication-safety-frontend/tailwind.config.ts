import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        clinical: {
          surface: "#f8fafc", // slate-50
          card: "#ffffff",
          border: "#e2e8f0", // slate-200
          text: "#0f172a", // slate-900
          muted: "#64748b", // slate-500
          subtle: "#f1f5f9", // slate-100
        },
      },
    },
  },
  plugins: [],
};

export default config;
