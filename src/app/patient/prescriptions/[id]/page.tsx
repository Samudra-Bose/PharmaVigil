"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Pill,
  Sun,
  Moon,
  ArrowLeft,
  Building2,
  CheckCircle2,
} from "lucide-react";

export default function PatientPrescriptionDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const [caseData, setCaseData] = useState<FixtureCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);
        const data = await api.getCase(caseId);
        setCaseData(data);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [caseId]);

  const isReady = caseData?.status === "DISPENSING_AUTHORIZED";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Pill className="w-5 h-5 text-slate-700" />
            Medication Schedule & Instructions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Prescription #{caseId} • Prescribed by Dr. Arvind Patel, MD
          </p>
        </div>

        <Link href="/patient/prescriptions">
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Prescriptions
          </Button>
        </Link>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-6">
          {/* Status Alert Card */}
          <Card className="shadow-2xs">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Current Dispensing Status
                </div>
                <div className="text-base font-bold text-slate-900">
                  {isReady
                    ? "Ready for Pick-up at Hospital Pharmacy"
                    : "Prescription Under Verification"}
                </div>
              </div>
              <Badge
                variant={isReady ? "authorized" : "moderate"}
                className="text-xs py-1 px-3"
              >
                {isReady ? "Authorized for Dispensing" : "In Review"}
              </Badge>
            </CardContent>
          </Card>

          {/* Daily Schedule Cards */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Daily Medication Routine
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caseData?.items.map((item, idx) => (
                <Card key={idx} className="shadow-2xs">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {item.canonicalIngredientIds.join(", ")}
                        </h3>
                        {item.brandText && (
                          <div className="text-xs text-slate-500 font-medium">
                            Brand: {item.brandText}
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold font-tabular">
                        {item.strengthValue}
                        {item.strengthUnit}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        {idx % 2 === 0 ? (
                          <Moon className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Sun className="w-4 h-4 text-amber-500" />
                        )}
                        <span>{item.frequency || "Once Daily"}</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Take {item.doseValue} {item.dosageForm} orally with
                        water.
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex justify-between font-mono pt-1 font-tabular">
                      <span>
                        Duration: {item.durationValue} {item.durationUnit}
                      </span>
                      <span>Route: {item.route || "Oral"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
