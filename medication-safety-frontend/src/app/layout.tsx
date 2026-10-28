import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalBanner } from "@/components/layout/GlobalBanner";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HotkeysHandler } from "@/components/layout/HotkeysHandler";

export const metadata: Metadata = {
  title: "PharmaVigil — Hospital Outpatient Medication Safety Platform",
  description: "A hospital-focused medication-safety workflow prototype for prescription verification, deterministic rule checks, and clinical review routing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col font-sans text-slate-900 bg-clinical-canvas antialiased selection:bg-slate-200">
        <AuthProvider>
          <HotkeysHandler />
          <GlobalBanner />
          <AppHeader />
          <div className="flex-1 flex min-h-0 w-full overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 py-4">
                <Breadcrumbs />
                {children}
              </main>
              <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="font-semibold text-slate-700">PharmaVigil</span>
                  <span className="text-[11px] text-slate-500">
                    Synthetic demonstration only — not for clinical use. Pinned OpenAPI 3.1.1.
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Hospital: Metro General (DEMO)
                  </span>
                </div>
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
