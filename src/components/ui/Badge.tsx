import React from "react";
import { cn } from "@/lib/utils";
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Info, 
  ShieldAlert, 
  XCircle 
} from "lucide-react";

export type BadgeVariant = 
  | "critical" 
  | "high" 
  | "moderate" 
  | "warning"
  | "info" 
  | "neutral" 
  | "authorized" 
  | "failed" 
  | "incomplete"
  | "mock";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  icon = true,
  className,
  ...props
}) => {
  const getIcon = () => {
    if (!icon) return null;
    switch (variant) {
      case "critical":
        return <AlertOctagon className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />;
      case "high":
        return <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />;
      case "moderate":
        return <Clock className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />;
      case "warning":
        return <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0 text-amber-600" aria-hidden="true" />;
      case "failed":
        return <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />;
      case "incomplete":
        return <ShieldAlert className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />;
      case "authorized":
        return <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />;
      case "info":
        return <Info className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden="true" />;
      case "mock":
        return <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const variantStyles: Record<BadgeVariant, string> = {
    critical: "bg-rose-50 text-rose-800 border-rose-300 font-semibold",
    high: "bg-amber-50 text-amber-900 border-amber-300 font-semibold",
    moderate: "bg-yellow-50 text-yellow-900 border-yellow-300 font-medium",
    warning: "bg-amber-50 text-amber-900 border-amber-300 font-medium",
    info: "bg-blue-50 text-blue-900 border-blue-200 font-medium",
    neutral: "bg-slate-100 text-slate-800 border-slate-300 font-medium",
    authorized: "bg-teal-50 text-teal-800 border-teal-300 font-semibold",
    failed: "bg-rose-100 text-rose-900 border-rose-400 font-semibold",
    incomplete: "bg-orange-50 text-orange-900 border-orange-300 font-medium",
    mock: "bg-amber-100 text-amber-950 border-amber-400 font-mono text-[11px] font-semibold tracking-wider uppercase",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs border tracking-tight",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {getIcon()}
      <span>{children}</span>
    </span>
  );
};
