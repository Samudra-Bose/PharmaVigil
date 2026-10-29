"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { openCommandPalette } from "@/components/layout/CommandPalette";
import { openShortcutsModal } from "@/components/layout/ShortcutsModal";
import { Kbd } from "@/components/ui/Kbd";
import { Shield, Sparkles, Keyboard } from "lucide-react";

export const AppFooter: React.FC = React.memo(function AppFooter() {
  const { hospitalName } = useAuth();
  return (
    <footer className="bg-white/80 backdrop-blur-xs border-t border-slate-200/80 py-3 text-xs text-slate-500 select-none">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold">
            <Shield className="size-3 text-emerald-400" />
          </div>
          <span className="font-bold text-slate-800">PharmaVigil</span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] text-slate-500">
            Fail-Closed Outpatient Medication Safety
          </span>
        </div>

        {/* Quick Accessibility & Hotkey Helpers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer"
            title="Open Command Palette (⌘K)"
          >
            <Sparkles className="size-3 text-teal-600" />
            <span>Spotlight</span>
            <Kbd className="bg-white border-slate-200 text-slate-500 text-[9px] px-1 py-0.2">
              ⌘K
            </Kbd>
          </button>

          <button
            type="button"
            onClick={openShortcutsModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-medium text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer"
            title="Open Keyboard Shortcuts (?)"
          >
            <Keyboard className="size-3 text-teal-600" />
            <span>Shortcuts</span>
            <Kbd className="bg-white border-slate-200 text-slate-500 text-[9px] px-1 py-0.2">
              ?
            </Kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>Hospital: {hospitalName}</span>
        </div>
      </div>
    </footer>
  );
});
