"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Fail-closed error logging
    console.error("Clinical UI runtime error boundary intercepted:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white p-6 rounded-lg border border-rose-200 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-semibold text-rose-950 tracking-tight">
          System Interruption (Fail-Closed)
        </h1>
        <p className="mt-2 text-xs text-rose-900/80 leading-relaxed">
          An application error occurred. To protect patient safety, clinical workflow advancement is halted.
          No unverified state has been authorized.
        </p>

        {error.digest && (
          <div className="mt-3 p-2 bg-slate-50 rounded border border-slate-200 text-left">
            <span className="text-[10px] font-mono text-slate-500">Error Digest: {error.digest}</span>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => reset()} className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Attempt Safe Reload
          </Button>
        </div>
      </div>
    </div>
  );
}
