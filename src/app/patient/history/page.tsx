"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDateTime } from "@/lib/utils";
import { Clock, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function PatientHistoryPage() {
  const [cases, setCases] = useState<FixtureCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getCases();
        setCases(data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            My Past Medication History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical records of completed outpatient prescriptions at Metro General Hospital
          </p>
        </div>

        <Link href="/patient">
          <Button size="sm" variant="outline" className="text-xs gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
          </Button>
        </Link>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-4">
          {cases.map((c) => (
            <Card key={c.id} className="shadow-2xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-900 font-mono font-tabular">Prescription #{c.id}</span>
                  <span className="text-xs text-slate-400 font-mono font-tabular">{formatDateTime(c.createdAt)}</span>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  {c.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="font-semibold text-slate-900">{item.canonicalIngredientIds.join(", ")} {item.strengthValue}{item.strengthUnit}</span>
                      <span className="text-slate-500 font-mono font-tabular">{item.durationValue} {item.durationUnit}</span>
                    </div>
                  ))}
                </div>

                {c.dispensingAuthorization && (
                  <div className="pt-2 flex items-center gap-2 text-teal-800 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Dispensed on {formatDateTime(c.dispensingAuthorization.authorizedAt)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
