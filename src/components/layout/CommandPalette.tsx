"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { openShortcutsModal } from "@/components/layout/ShortcutsModal";
import {
  Search,
  Pill,
  Stethoscope,
  User,
  ShieldAlert,
  Camera,
  ClipboardList,
  History,
  BookOpenCheck,
  FileSearch,
  Users,
  UserCheck,
  Calendar,
  BedDouble,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  X,
  ShieldCheck,
  Activity,
  KeyRound,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/utils";

export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  }
}

interface CommandItem {
  id: string;
  category: "Portals" | "Actions" | "Patients" | "Safety Rules";
  title: string;
  subtitle: string;
  keywords?: string[];
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  shortcut?: string[];
  perform: () => void;
}

export const CommandPalette: React.FC = () => {
  const router = useRouter();
  const { user, role, switchRole, logout, isMockMode } = useAuth();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
      setSearch("");
      setSelectedIndex(0);
    };
    const handleToggle = () => {
      setOpen((prev) => !prev);
      setSearch("");
      setSelectedIndex(0);
    };

    window.addEventListener("open-command-palette", handleOpen);
    window.addEventListener("toggle-command-palette", handleToggle);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setSearch("");
        setSelectedIndex(0);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("open-command-palette", handleOpen);
      window.removeEventListener("toggle-command-palette", handleToggle);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const navigateTo = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const allItems: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      // 1. QUICK ACTIONS
      {
        id: "action-capture",
        category: "Actions",
        title: "Capture Prescription via Camera / OCR",
        subtitle: "Scan prescription slip and run deterministic OCR digitizer",
        keywords: ["scan", "camera", "ocr", "upload", "prescription", "image"],
        icon: Camera,
        badge: "Pharmacist",
        shortcut: ["G", "C"],
        perform: () => navigateTo("/pharmacist/capture"),
      },
      {
        id: "action-shortcuts",
        category: "Actions",
        title: "View Keyboard Shortcuts Cheat Sheet",
        subtitle: "See all keyboard shortcuts for power-user clinical workflow",
        keywords: ["help", "shortcuts", "keys", "hotkeys"],
        icon: Sparkles,
        shortcut: ["?"],
        perform: () => {
          setOpen(false);
          openShortcutsModal();
        },
      },
      ...(isMockMode
        ? [
            {
              id: "action-switch-pharmacist",
              category: "Actions" as const,
              title: "Switch Persona to Pharmacist (Priya Sharma, RPh)",
              subtitle: "Open CDS verification, dispensing gate, and OCR queue",
              keywords: ["switch", "pharmacist", "priya", "role"],
              icon: Pill,
              shortcut: ["⌥", "1"],
              perform: () => {
                switchRole("PHARMACIST");
                navigateTo("/pharmacist");
              },
            },
            {
              id: "action-switch-doctor",
              category: "Actions" as const,
              title: "Switch Persona to Doctor (Dr. Arvind Patel, MD)",
              subtitle: "Open triage queue, author revisions, and review safety alerts",
              keywords: ["switch", "doctor", "physician", "arvind", "role"],
              icon: Stethoscope,
              shortcut: ["⌥", "2"],
              perform: () => {
                switchRole("DOCTOR");
                navigateTo("/doctor");
              },
            },
            {
              id: "action-switch-patient",
              category: "Actions" as const,
              title: "Switch Persona to Patient (Rajan Sharma)",
              subtitle: "Open patient hub, dose tracking, and medication list",
              keywords: ["switch", "patient", "rajan", "role"],
              icon: User,
              shortcut: ["⌥", "3"],
              perform: () => {
                switchRole("PATIENT");
                navigateTo("/patient");
              },
            },
            {
              id: "action-switch-admin",
              category: "Actions" as const,
              title: "Switch Persona to Hospital Admin (Govinda Rao)",
              subtitle: "Open hospital governance, clinical rules, and audit trail",
              keywords: ["switch", "admin", "governance", "govinda", "role"],
              icon: ShieldAlert,
              shortcut: ["⌥", "4"],
              perform: () => {
                switchRole("HOSPITAL_ADMIN");
                navigateTo("/admin");
              },
            },
          ]
        : []),

      // 2. CLINICAL PORTALS & WORKSPACES
      {
        id: "portal-pharmacist",
        category: "Portals",
        title: "Pharmacist Work Queue",
        subtitle: "Outpatient clinical safety verification & locked dispensing queue",
        keywords: ["pharmacist", "work queue", "dispense", "ddi"],
        icon: Pill,
        shortcut: ["G", "P"],
        perform: () => navigateTo("/pharmacist"),
      },
      {
        id: "portal-inpatient-orders",
        category: "Portals",
        title: "Inpatient Medication Orders",
        subtitle: "Active hospital floor medication orders and reconciliation",
        keywords: ["orders", "inpatient", "floor", "hospital"],
        icon: BedDouble,
        perform: () => navigateTo("/pharmacist/orders"),
      },
      {
        id: "portal-patient-search",
        category: "Portals",
        title: "Patient Directory Search",
        subtitle: "Lookup patients by MRN, government identity, or full name",
        keywords: ["patient", "search", "directory", "mrn", "lookup"],
        icon: User,
        shortcut: ["G", "S"],
        perform: () => navigateTo("/pharmacist/patients/search"),
      },
      {
        id: "portal-dispense-history",
        category: "Portals",
        title: "Audit & Dispense History",
        subtitle: "Immutable append-only dispensing ledger and authorization logs",
        keywords: ["history", "audit", "dispense", "ledger", "log"],
        icon: History,
        perform: () => navigateTo("/pharmacist/history"),
      },
      {
        id: "portal-doctor-triage",
        category: "Portals",
        title: "Doctor Triage Tasks Queue",
        subtitle: "Review clinical flags, adjust regimens, and author signed rationales",
        keywords: ["doctor", "triage", "md", "tasks", "flags", "alerts"],
        icon: Stethoscope,
        shortcut: ["G", "D"],
        perform: () => navigateTo("/doctor"),
      },
      {
        id: "portal-doctor-prescriptions",
        category: "Portals",
        title: "Prescriptions Ledger (MD)",
        subtitle: "Complete repository of written and counter-signed outpatient orders",
        keywords: ["prescriptions", "doctor", "ledger", "orders"],
        icon: ClipboardList,
        perform: () => navigateTo("/doctor/prescriptions"),
      },
      {
        id: "portal-patient-hub",
        category: "Portals",
        title: "Patient Care Overview",
        subtitle: "Patient health dashboard, active medications, and adherence",
        keywords: ["patient", "hub", "care", "health"],
        icon: Activity,
        shortcut: ["G", "H"],
        perform: () => navigateTo("/patient"),
      },
      {
        id: "portal-patient-prescriptions",
        category: "Portals",
        title: "My Prescriptions & Refills",
        subtitle: "Track prescription readiness, dosage schedules, and pharmacy pickup",
        keywords: ["patient", "prescriptions", "refills", "pickup"],
        icon: Pill,
        perform: () => navigateTo("/patient/prescriptions"),
      },
      {
        id: "portal-admin-governance",
        category: "Portals",
        title: "Hospital Governance Dashboard",
        subtitle: "Hospital-wide safety telemetry, pending clinician memberships, and stats",
        keywords: ["admin", "governance", "hospital", "telemetry"],
        icon: ShieldAlert,
        shortcut: ["G", "A"],
        perform: () => navigateTo("/admin"),
      },
      {
        id: "portal-admin-rules",
        category: "Portals",
        title: "Clinical Rulesets & Verification",
        subtitle: "Inspect deterministic rules (DDI, dose caps, contraindications)",
        keywords: ["rules", "cds", "clinical", "engine", "safety"],
        icon: BookOpenCheck,
        perform: () => navigateTo("/admin/rules"),
      },
      {
        id: "portal-admin-audit",
        category: "Portals",
        title: "Comprehensive Audit Trail",
        subtitle: "Cryptographic event log of every clinical evaluation and override",
        keywords: ["audit", "trail", "log", "security", "ledger"],
        icon: FileSearch,
        perform: () => navigateTo("/admin/audit"),
      },
      {
        id: "portal-auth-directory",
        category: "Portals",
        title: "Clinical Portal Login Directory",
        subtitle: "Gateway to Doctor, Pharmacist, Patient, and Admin login portals",
        keywords: ["login", "portals", "auth", "signin", "switch"],
        icon: KeyRound,
        perform: () => navigateTo("/auth/login"),
      },

      // 3. PATIENTS DIRECTORY
      {
        id: "patient-rajan",
        category: "Patients",
        title: "Rajan Sharma (MRN: P-9021)",
        subtitle: "Cardiology • Warfarin 5mg daily • Case #9021-01 Bleed Hazard",
        keywords: ["rajan", "sharma", "p-9021", "9021", "warfarin", "cardiology"],
        icon: User,
        badge: "P-9021",
        perform: () => navigateTo("/pharmacist/cases/case_rx_9021_01/results"),
      },
      {
        id: "patient-eleanor",
        category: "Patients",
        title: "Eleanor Vance (MRN: P-8832)",
        subtitle: "Rheumatology • Methotrexate 15mg weekly • High-Risk Interlock",
        keywords: ["eleanor", "vance", "p-8832", "8832", "methotrexate", "rheumatology"],
        icon: User,
        badge: "P-8832",
        perform: () => navigateTo("/pharmacist/patients/search?q=P-8832"),
      },
      {
        id: "patient-marcus",
        category: "Patients",
        title: "Marcus Brody (MRN: P-4109)",
        subtitle: "Nephrology • Allopurinol 300mg daily • Renal Clearance Watch",
        keywords: ["marcus", "brody", "p-4109", "4109", "allopurinol", "gout"],
        icon: User,
        badge: "P-4109",
        perform: () => navigateTo("/pharmacist/patients/search?q=P-4109"),
      },
      {
        id: "patient-sarah",
        category: "Patients",
        title: "Sarah Jenkins (MRN: P-3312)",
        subtitle: "Endocrinology • Metformin 500mg BID • Routine Safety Clear",
        keywords: ["sarah", "jenkins", "p-3312", "3312", "metformin", "diabetes"],
        icon: User,
        badge: "P-3312",
        perform: () => navigateTo("/pharmacist/patients/search?q=P-3312"),
      },

      // 4. CLINICAL SAFETY RULES & INTERLOCKS
      {
        id: "rule-warfarin-aspirin",
        category: "Safety Rules",
        title: "Warfarin + Aspirin Bleed Hazard (RULE-DDI-001)",
        subtitle: "Critical CYP2C9 metabolic and platelet aggregation inhibition",
        keywords: ["rule-ddi-001", "warfarin", "aspirin", "bleed", "inr", "cyp2c9"],
        icon: AlertTriangle,
        badge: "Critical DDI",
        perform: () => navigateTo("/admin/rules"),
      },
      {
        id: "rule-methotrexate-nsaid",
        category: "Safety Rules",
        title: "Methotrexate + NSAID Clearance Hazard (RULE-DDI-002)",
        subtitle: "Severe reduction in tubular secretion leading to bone marrow toxicity",
        keywords: ["rule-ddi-002", "methotrexate", "nsaid", "myelosuppression", "toxicity"],
        icon: AlertTriangle,
        badge: "Severe DDI",
        perform: () => navigateTo("/admin/rules"),
      },
      {
        id: "rule-fail-closed",
        category: "Safety Rules",
        title: "Fail-Closed Clinical Interlock (SAFETY-GATE-01)",
        subtitle: "Deterministic zero-trust gate locks dispensing on unverified interactions",
        keywords: ["fail closed", "safety gate", "interlock", "gate", "lock"],
        icon: ShieldCheck,
        badge: "Fail-Closed",
        perform: () => navigateTo("/admin/rules"),
      },
    ];

    return items;
  }, [isMockMode, switchRole, navigateTo]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase().trim();
    return allItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchSubtitle || matchCategory || matchKeywords;
    });
  }, [allItems, search]);

  // Keep selected index bounded
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Auto scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredItems.length ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].perform();
      }
    }
  };

  if (!open) return null;

  // Group filtered items by category
  const categories: Array<CommandItem["category"]> = ["Actions", "Portals", "Patients", "Safety Rules"];
  let cumulativeIndex = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 bg-slate-950/45 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col text-slate-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <Search className="size-4.5 text-teal-700 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, patient MRN, drug interaction, or portal..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
            aria-label="Search Command Palette"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              title="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
          <Kbd className="bg-white border-slate-200 text-slate-500 text-[10px] hidden sm:inline-flex">
            ESC
          </Kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 space-y-4 divide-y divide-slate-100/80"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Search className="size-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching clinical commands</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try searching for &quot;Warfarin&quot;, &quot;P-9021&quot;, &quot;Capture&quot;, or &quot;Doctor&quot;
              </p>
            </div>
          ) : (
            categories.map((cat) => {
              const itemsInCat = filteredItems.filter((i) => i.category === cat);
              if (itemsInCat.length === 0) return null;

              return (
                <div key={cat} className="pt-2 first:pt-0 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {cat}
                  </div>
                  {itemsInCat.map((item) => {
                    cumulativeIndex++;
                    const currentIndex = cumulativeIndex;
                    const isSelected = currentIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        data-selected={isSelected}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        onClick={item.perform}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs group",
                          isSelected
                            ? "bg-teal-50/90 text-teal-950 font-medium border border-teal-200/80 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "bg-teal-700 text-white shadow-2xs"
                                : "bg-slate-100 text-slate-500 group-hover:text-slate-800"
                            )}
                          >
                            <Icon className="size-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-bold truncate text-[13px]",
                                  isSelected ? "text-teal-950" : "text-slate-900"
                                )}
                              >
                                {item.title}
                              </span>
                              {item.badge && (
                                <span
                                  className={cn(
                                    "text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border",
                                    isSelected
                                      ? "bg-teal-100/90 text-teal-800 border-teal-300/80"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p
                              className={cn(
                                "text-[11px] truncate mt-0.5",
                                isSelected ? "text-teal-800/80" : "text-slate-500"
                              )}
                            >
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Shortcuts & Action Arrow */}
                        <div className="flex items-center gap-2 shrink-0">
                          {item.shortcut && (
                            <div className="hidden sm:flex items-center gap-1">
                              {item.shortcut.map((k, kIdx) => (
                                <Kbd
                                  key={kIdx}
                                  className={cn(
                                    "px-1.5 py-0.5 text-[10px] font-bold",
                                    isSelected
                                      ? "bg-white text-teal-900 border-teal-300"
                                      : "bg-slate-50 text-slate-600 border-slate-200"
                                  )}
                                >
                                  {k}
                                </Kbd>
                              ))}
                            </div>
                          )}
                          {isSelected && (
                            <div className="size-5 rounded flex items-center justify-center text-teal-700 bg-white border border-teal-200">
                              <CornerDownLeft className="size-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd className="bg-white">↑</Kbd>
              <Kbd className="bg-white">↓</Kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd className="bg-white">↵</Kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd className="bg-white">esc</Kbd>
              <span>dismiss</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-teal-700 font-medium">
            <Sparkles className="size-3" />
            <span>PharmaVigil Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
};
