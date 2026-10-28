"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PatientAllergiesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/patient/medication-history");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="size-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Redirecting to Medication & Allergy reporting...</span>
      </div>
    </div>
  );
}
