"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import { ClinicalTooltip } from "@/components/clinical/ClinicalTooltip";
import { formatDateTime } from "@/lib/utils";
import { History, GitCommit, FileText, CheckCircle2 } from "lucide-react";

export default function HistoryPage() {
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-700" />
          Prescription Revision & Audit Trail History
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable revision progression, historical check executions, and
          dispensing timestamps
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-6">
          {cases.map((c) => (
            <Card key={c.id} className="shadow-2xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 font-tabular">
                      {c.id}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-tabular">
                      Patient: {c.patientId}
                    </span>
                  </div>
                  <Badge
                    variant={
                      c.status === "DISPENSING_AUTHORIZED"
                        ? "authorized"
                        : "info"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>

                {/* Revision Timeline */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-slate-500" />{" "}
                    Revision History ({c.revisions.length})
                  </h3>

                  <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-2">
                    {c.revisions.map((rev) => (
                      <div
                        key={rev.id}
                        className="relative space-y-1.5 text-xs py-1"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 absolute -left-[21px] top-2" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Revision {rev.revisionNumber}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px] font-tabular">
                            {formatDateTime(rev.createdAt)}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                          <div className="text-[11px] font-semibold text-slate-700">
                            Prescribed Items:
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-mono text-[11px]">
                            {rev.items.map((item, i) => (
                              <li key={i}>
                                {item.canonicalIngredientIds.join(", ")}{" "}
                                {item.strengthValue}
                                {item.strengthUnit} — {item.frequency}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispensing Authorization Summary */}
                {c.dispensingAuthorization && (
                  <div className="p-3 bg-teal-50/60 rounded border border-teal-200 text-xs text-teal-950 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        Dispensing Authorized by{" "}
                        <span className="font-semibold">
                          {c.dispensingAuthorization.authorizedBy}
                        </span>
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-teal-800 font-tabular">
                      {formatDateTime(c.dispensingAuthorization.authorizedAt)}
                    </span>
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
