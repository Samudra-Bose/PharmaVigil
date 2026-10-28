"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api-client";

function DoctorCaseDispositionRedirect() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function findTaskAndRedirect() {
      try {
        const c = await api.getCase(caseId);
        const alertId = c?.alerts?.[0]?.id || "alert_ddi_statin_macrolide_001";
        router.replace(`/doctor/tasks/${alertId}/disposition?caseId=${caseId}`);
      } catch (err) {
        console.error("Failed to route disposition:", err);
        router.replace(`/doctor/tasks/alert_ddi_statin_macrolide_001/disposition?caseId=${caseId}`);
      }
    }

    if (caseId) {
      findTaskAndRedirect();
    }
  }, [caseId, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="size-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Routing to Attending Physician Disposition...</span>
      </div>
    </div>
  );
}

export default function DoctorCaseDispositionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono text-xs">Loading...</div>}>
      <DoctorCaseDispositionRedirect />
    </Suspense>
  );
}
