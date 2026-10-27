"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  pharmacist: "Pharmacist Portal",
  patients: "Patients",
  search: "Patient Search",
  confirm: "Identity Confirmation",
  capture: "Prescription Capture",
  cases: "Case Queue",
  extract: "OCR Extraction Review",
  medicines: "Medicine Reconciliation",
  check: "Safety Rule Engine",
  results: "Clinical Results",
  authorize: "Dispensing Authorization",
  history: "Audit Ledger",
  doctor: "Doctor Portal",
  tasks: "Triage Tasks",
  disposition: "Clinical Disposition",
  prescriptions: "Prescriptions",
  new: "New Entry",
  appointments: "Appointments",
  patient: "Patient Portal",
  "medication-history": "Report Meds & Allergies",
  orders: "Inpatient Orders",
  admin: "Administrator Portal",
  audit: "Audit Trail",
  rules: "Clinical Rulesets",
  memberships: "Staff Memberships",
  users: "Clinician Directory",
  "demo-reset": "Demo Reset",
};

export const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();

  if (!pathname || pathname === "/" || pathname.startsWith("/auth")) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) {
    return null; // Don't show redundant 1-item breadcrumb on root portal page
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-[11px] font-medium text-slate-500 mb-4 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
      <ol className="flex items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-800 transition-colors"
            title="Gateway Home"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>

        {segments.map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const isLast = idx === segments.length - 1;
          const isId = seg.startsWith("case_") || seg.startsWith("pat_") || seg.startsWith("P-") || seg.startsWith("mem_") || seg.startsWith("usr_");
          const label = isId ? `#${seg}` : (ROUTE_LABELS[seg] || seg.replace(/-/g, " "));

          return (
            <React.Fragment key={href}>
              <li aria-hidden="true" className="text-slate-300">
                <ChevronRight className="w-3 h-3" />
              </li>
              <li>
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]"
                  >
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
