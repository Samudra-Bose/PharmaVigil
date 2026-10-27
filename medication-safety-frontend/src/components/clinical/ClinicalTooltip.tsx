"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { HelpCircle } from "lucide-react";

interface ClinicalTooltipProps {
  term: string;
  explanation: string;
  code?: string;
  children?: React.ReactNode;
}

export const ClinicalTooltip: React.FC<ClinicalTooltipProps> = ({
  term,
  explanation,
  code,
  children,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-slate-400 font-medium">
            {children || term}
            <HelpCircle className="w-3 h-3 text-slate-400 shrink-0 inline" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-1">
          <div className="font-bold text-slate-100 flex items-center justify-between gap-2">
            <span>{term}</span>
            {code && <span className="font-mono text-[9px] text-slate-400">{code}</span>}
          </div>
          <p className="text-[11px] text-slate-300 leading-normal">{explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
