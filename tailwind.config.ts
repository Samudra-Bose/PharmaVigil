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
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        canvas: "#eff2f6",
        forest: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b", // Deep luxury forest green
          950: "#022c22",
        },
        clinical: {
          canvas: "#eff2f6",
          surface: "#ffffff",
          "surface-raised": "#f8fafc",
          navy: "#0f172a",
          "navy-light": "#1e293b",
          teal: {
            DEFAULT: "#0d9488",
            hover: "#0f766e",
            subtle: "#f0fdfa",
            border: "#99f6e4",
          },
          amber: {
            DEFAULT: "#d97706",
            hover: "#b45309",
            subtle: "#fffbeb",
            border: "#fde68a",
          },
          rose: {
            DEFAULT: "#e11d48",
            hover: "#be123c",
            subtle: "#fff1f2",
            border: "#fecdd3",
          },
          slate: {
            DEFAULT: "#64748b",
            light: "#94a3b8",
            subtle: "#f8fafc",
            border: "#e2e8f0",
          },
          border: "#e2e8f0",
          text: "#0f172a",
          muted: "#64748b",
          subtle: "#f1f5f9",
        },
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)",
        lux: "0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.04)",
        "lux-hover": "0 14px 35px -5px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.06)",
        "lux-black": "0 16px 36px -8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        dropdown: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)",
        modal: "0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
      },
    },
  },
  plugins: [
    require("daisyui"),
  ],
  // @ts-ignore
  daisyui: {
    prefix: "du-",
    themes: ["light"],
    logs: false,
  },
};

export default config;
