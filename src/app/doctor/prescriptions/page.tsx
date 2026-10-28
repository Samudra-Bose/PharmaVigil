"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { FixtureCase } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PrescriptionTableSkeleton } from "@/components/skeletons";
import { formatDateTime } from "@/lib/utils";
import { FileText, Plus, GitCommit, ArrowRight } from "lucide-react";

export default function DoctorPrescriptionsPage() {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            Hospital Prescriptions & Revision Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active prescriptions, historical revisions, and safety check
            outcomes
          </p>
        </div>

        <Button asChild size="sm" variant="primary" className="text-xs gap-1.5">
          <Link href="/doctor/prescriptions/new">
            <Plus className="w-3.5 h-3.5" /> + Create Prescription
          </Link>
        </Button>
      </div>

      {loading ? (
        <PrescriptionTableSkeleton rowCount={4} />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Prescription / Case ID</th>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Current Revision</th>
                <th className="py-3 px-4">Prescribed Items</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {c.id}
                  </td>
                  <td className="py-3 px-4 font-mono">{c.patientId}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                      Rev {c.currentRevisionNumber} ({c.revisions.length} total)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">
                      {c.items
                        .map((i) => i.canonicalIngredientIds.join(", "))
                        .join("; ")}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        c.status === "DISPENSING_AUTHORIZED"
                          ? "authorized"
                          : "info"
                      }
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1 h-7"
                    >
                      <Link href={`/doctor/prescriptions/new?caseId=${c.id}`}>
                        Revise <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
