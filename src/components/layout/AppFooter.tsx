"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export const AppFooter: React.FC = () => {
  const { hospitalName } = useAuth();
  return (
    <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-semibold text-slate-700">PharmaVigil</span>
        <span className="text-[11px] text-slate-500">
          Synthetic demonstration only — not for clinical use. Pinned OpenAPI 3.1.1.
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Hospital: {hospitalName}
        </span>
      </div>
    </footer>
  );
};
