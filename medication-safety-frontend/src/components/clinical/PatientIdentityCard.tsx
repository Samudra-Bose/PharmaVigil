import React from "react";
import type { PatientRecord } from "@/lib/mock-data/fixtures";
import { Badge } from "@/components/ui/Badge";
import { User, AlertOctagon, Pill } from "lucide-react";

interface PatientIdentityCardProps {
  patient: PatientRecord;
  showActions?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const PatientIdentityCard: React.FC<PatientIdentityCardProps> = ({
  patient,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-slate-100/70 p-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {patient.displayName}
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white text-slate-800 border border-slate-200 font-semibold">
                {patient.syntheticHospitalPatientId}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Record ID: {patient.id}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-4">
          <div>
            <span className="text-slate-400">DOB: </span>
            <span className="font-semibold text-slate-800">{patient.dateOfBirth || "1968-04-12"}</span>
          </div>
          <div>
            <span className="text-slate-400">Gender: </span>
            <span className="font-semibold text-slate-800">{patient.gender || "MALE"}</span>
          </div>
        </div>
      </div>

      {/* Clinical Context */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Allergies */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> Known Allergies & Adverse Reactions
          </div>
          {patient.knownAllergies && patient.knownAllergies.length > 0 ? (
            <div className="space-y-1.5">
              {patient.knownAllergies.map((alg) => (
                <div
                  key={alg.id}
                  className="p-2 rounded bg-rose-50/70 border border-rose-200 flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-rose-900">{alg.allergenName}</span>
                    <span className="text-rose-700"> — {alg.reaction}</span>
                  </div>
                  <Badge variant={alg.severity === "CRITICAL" ? "critical" : "moderate"} className="text-[10px] py-0">
                    {alg.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 italic">No allergies recorded in synthetic profile.</div>
          )}
        </div>

        {/* Active Medications */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
            <Pill className="w-3.5 h-3.5 text-blue-500" /> Current Active Prescriptions
          </div>
          {patient.activeMedications && patient.activeMedications.length > 0 ? (
            <div className="space-y-1.5">
              {patient.activeMedications.map((med) => (
                <div
                  key={med.id}
                  className="p-2 rounded bg-slate-50 border border-slate-200 flex items-start justify-between gap-2"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{med.ingredientName}</span>
                    {med.brandName && <span className="text-slate-500"> ({med.brandName})</span>}
                    <div className="text-[11px] text-slate-600">{med.dosage} • {med.frequency}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Since {med.startedAt}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 italic">No active medications recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
};
