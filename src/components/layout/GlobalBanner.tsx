"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";

export const GlobalBanner: React.FC = () => {
  const { isMockMode } = useAuth();

  return (
    <aside
      aria-label="Demo environment notice"
      className="bg-slate-900 text-slate-300 text-[11px] h-7 px-4 flex items-center justify-between border-b border-slate-800 tracking-tight select-none z-50 shrink-0 font-mono"
    >
      <div className="flex items-center gap-2">
        <AlertCircle
          className="w-3.5 h-3.5 text-amber-400 shrink-0"
          aria-hidden="true"
        />
        <span className="text-slate-300 font-normal">
          Synthetic demonstration only —{" "}
          <span className="text-slate-400">not for clinical use</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isMockMode && (
          <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-300/90 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
            <span
              className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
              aria-hidden="true"
            />
            Mock Mode
          </span>
        )}
      </div>
    </aside>
  );
};
