"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import type { PatientRecord } from "@/lib/mock-data/fixtures";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Search, UserCheck, ArrowRight, ShieldCheck, User } from "lucide-react";

export default function PatientSearchPage() {
  const [query, setQuery] = useState("P-9021");
  const [results, setResults] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await api.searchPatients(query.trim());
      setResults(data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-700" />
          Patient Search & Identity Identification
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Lookup patient by synthetic hospital ID (e.g. <span className="font-mono font-bold text-slate-700">P-9021</span>) before prescription capture
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter synthetic ID (e.g. P-9021) or patient name..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <Button type="submit" variant="primary" loading={loading} className="gap-2 shrink-0">
            <Search className="w-4 h-4" /> Search Patient
          </Button>
        </form>

        {/* Quick Synthetic Demo Presets */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="font-semibold text-slate-700">Quick Test Synthetic IDs:</span>
          <button
            type="button"
            onClick={() => {
              setQuery("P-9021");
              api.searchPatients("P-9021").then((d) => {
                setResults(d);
                setSearched(true);
              });
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 font-mono font-semibold text-slate-800 transition-colors"
          >
            P-9021 (Rajan Sharma)
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Search Results ({results.length})
          </h2>

          {results.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
              No matching synthetic patient records found in Metro General Hospital workspace for "{query}".
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {patient.displayName}
                        <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold border border-slate-200">
                          {patient.syntheticHospitalPatientId}
                        </span>
                        <Badge variant="authorized" className="text-[10px] py-0">
                          {patient.linkStatus}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>DOB: <span className="font-medium text-slate-700">{patient.dateOfBirth}</span></span>
                        <span>Gender: <span className="font-medium text-slate-700">{patient.gender}</span></span>
                        <span>Phone: <span className="font-medium text-slate-700">{patient.contactPhone}</span></span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/pharmacist/patients/${patient.syntheticHospitalPatientId}/confirm`}>
                    <Button size="sm" variant="primary" className="gap-1.5 text-xs shrink-0 w-full sm:w-auto">
                      <UserCheck className="w-3.5 h-3.5" /> Explicitly Confirm Identity <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
