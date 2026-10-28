"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PrescriptionTableSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/Card";
import { Pill, ArrowRight, ArrowLeft } from "lucide-react";

export default function PatientPrescriptionsListPage() {
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
            <Pill className="w-5 h-5 text-violet-600" />
            My Prescribed Medications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active prescriptions and dispensing status from Metro General
            Hospital
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
          <Link href="/patient">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
          </Link>
        </Button>
      </div>

      {loading ? (
        <PrescriptionTableSkeleton rowCount={3} />
      ) : (
        <div className="space-y-4">
          {cases.map((c) => {
            const isAuthorized = c.status === "DISPENSING_AUTHORIZED";
            return (
              <Card key={c.id} className="shadow-2xs">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono font-tabular">
                        Prescription #{c.id}
                      </span>
                      <Badge variant={isAuthorized ? "authorized" : "moderate"}>
                        {isAuthorized
                          ? "Ready for Pick-up"
                          : "Under Pharmacy Review"}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">
                        Prescribed:{" "}
                      </span>
                      {c.items
                        .map(
                          (i) =>
                            `${i.canonicalIngredientIds.join(", ")} ${i.strengthValue}${i.strengthUnit}`,
                        )
                        .join(" • ")}
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono font-tabular">
                      Revision: {c.currentRevisionNumber} • Doctor: Dr. Arvind
                      Patel, MD
                    </div>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant="violet"
                    className="text-xs gap-1.5 shrink-0"
                  >
                    <Link href={`/patient/prescriptions/${c.id}`}>
                      View Schedule <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
