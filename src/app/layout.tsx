import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalBanner } from "@/components/layout/GlobalBanner";
import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { HotkeysHandler } from "@/components/layout/HotkeysHandler";
import { AppFooter } from "@/components/layout/AppFooter";

export const metadata: Metadata = {
  title: "PharmaVigil — Hospital Outpatient Medication Safety Platform",
  description:
    "A hospital-focused medication-safety workflow prototype for prescription verification, deterministic rule checks, and clinical review routing.",
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
          <Toaster richColors position="top-right" closeButton />
          <HotkeysHandler />
          <GlobalBanner />
          <AppHeader />
          <div className="flex-1 flex min-h-0 w-full overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
                <Breadcrumbs />
                {children}
              </main>
              <AppFooter />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
