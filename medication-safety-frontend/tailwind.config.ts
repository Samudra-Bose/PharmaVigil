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
          canvas: "#f8fafc",
          surface: "#ffffff",
          "surface-raised": "#f1f5f9",
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
        dropdown: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)",
        modal: "0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
