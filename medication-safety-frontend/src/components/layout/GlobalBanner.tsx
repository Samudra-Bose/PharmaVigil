"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { AlertCircle } from "lucide-react";

export const GlobalBanner: React.FC = () => {
  const { isMockMode } = useAuth();

  return (
    <div className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800 tracking-tight">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
        <span className="font-medium">
          Synthetic demonstration only — not for clinical use.
        </span>
      </div>

      <div className="flex items-center gap-2">
        {isMockMode && (
          <Badge variant="mock">
            Demo Mock Mode — Synthetic Fixtures
          </Badge>
        )}
      </div>
    </div>
  );
};
