"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ConfirmRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "P-9021";

  useEffect(() => {
    router.replace(`/pharmacist/patients/${id}/confirm`);
  }, [id, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="size-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Redirecting to patient verification...</span>
      </div>
    </div>
  );
}

export default function ConfirmRedirectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Loading...</div>}>
      <ConfirmRedirectContent />
    </Suspense>
  );
}
