"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { AuditEvent } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import {
  FileSearch,
  Filter,
  Search,
  Code2,
  Copy,
  Check,
  Shield,
  Activity,
  User,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Database,
  Terminal,
} from "lucide-react";

const RESOURCE_TYPES = [
  "ALL",
  "Prescription",
  "PrescriptionRevision",
  "PrescriptionCapture",
  "CheckRun",
  "Alert",
  "AlertDisposition",
  "DispensingAuthorization",
  "MedicationOrder",
  "Membership",
  "User",
  "DemoWorkspace",
];

export default function AdminAuditPage() {
  const { role } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceType, setResourceType] = useState("ALL");
  const [actorQuery, setActorQuery] = useState("");
  const [limit, setLimit] = useState(20);

  // Inspector Modal
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listAuditEvents({
        resourceType: resourceType !== "ALL" ? resourceType : undefined,
        actorUserId: actorQuery.trim() || undefined,
        limit,
      });
      setEvents(data);
    } catch (err) {
      console.error("Failed to load audit events", err);
    } finally {
      setLoading(false);
    }
  }, [resourceType, actorQuery, limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    if (!actorQuery.trim()) return events;
    const q = actorQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.actorUserId.toLowerCase().includes(q) ||
        e.actorDisplayName?.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.resourceId.toLowerCase().includes(q) ||
        e.requestId?.toLowerCase().includes(q),
    );
  }, [events, actorQuery]);

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredEvents.slice(start, start + limit);
  }, [filteredEvents, page, limit]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / limit));

  const handleCopyJson = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
    setCopied(true);
    toast.success("Audit event JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionBadge = (action: string) => {
    if (
      action.includes("CREATE") ||
      action.includes("AUTHORIZE") ||
      action.includes("APPROVE")
    ) {
      return (
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
          {action}
        </span>
      );
    }
    if (
      action.includes("DISPOSITION") ||
      action.includes("CHECK") ||
      action.includes("UPDATE")
    ) {
      return (
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
          {action}
        </span>
      );
    }
    if (
      action.includes("RESET") ||
      action.includes("CANCEL") ||
      action.includes("REVOKE")
    ) {
      return (
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
          {action}
        </span>
      );
    }
    return (
      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <FileSearch className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Compliance Audit Trail & Event Ledger
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filteredEvents.length} events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, hospital-scoped audit records of clinical determinations,
            medication revisions, and safety actions.
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
          <Link href="/admin">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Governance
          </Link>
        </Button>
      </div>

      {/* Filter and Query Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Resource Type Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Resource:</span>
            <select
              value={resourceType}
              onChange={(e) => {
                setResourceType(e.target.value);
                setPage(1);
              }}
              className="h-7 px-2 text-xs rounded border border-slate-200 bg-white font-medium text-slate-800"
            >
              {RESOURCE_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {rt === "ALL" ? "All Resources" : rt}
                </option>
              ))}
            </select>
          </div>

          {/* Page Limit */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="font-semibold text-slate-600">Rows:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="h-7 px-1.5 text-xs rounded border border-slate-200 bg-white font-medium"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Actor / ID Query Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search actor, action, request ID..."
            value={actorQuery}
            onChange={(e) => {
              setActorQuery(e.target.value);
              setPage(1);
            }}
            className="pl-8 text-xs h-7"
          />
        </div>
      </div>

      {/* Events Table */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          title="No audit events found"
          description="No compliance events match the selected resource type or search criteria."
          actionLabel="Reset Filters"
          onAction={() => {
            setResourceType("ALL");
            setActorQuery("");
          }}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Actor & Role</th>
                  <th className="py-3 px-4">Action Verb</th>
                  <th className="py-3 px-4">Resource Target</th>
                  <th className="py-3 px-4">Request Trace ID</th>
                  <th className="py-3 px-4 text-right">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {formatDateTime(evt.timestamp)}
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {evt.actorDisplayName || "System Actor"}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                        <span className="font-mono text-slate-400">
                          {evt.actorUserId}
                        </span>
                        {evt.actorRole && (
                          <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                            {evt.actorRole}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4">{getActionBadge(evt.action)}</td>

                    {/* Resource Target */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {evt.resourceType}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 block truncate max-w-[160px]">
                        #{evt.resourceId}
                      </span>
                    </td>

                    {/* Request Trace ID */}
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                      {evt.requestId || "—"}
                    </td>

                    {/* Payload Inspect Button */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1 h-7 font-mono"
                        onClick={() => {
                          setSelectedEvent(evt);
                          setInspectorOpen(true);
                        }}
                      >
                        <Code2 className="w-3 h-3 text-slate-500" /> Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50/60 text-xs">
              <span className="text-slate-500">
                Showing page <strong>{page}</strong> of{" "}
                <strong>{totalPages}</strong> ({filteredEvents.length} total)
              </span>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-7 px-2 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-7 px-2 text-xs"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* JSON Payload Inspector Modal */}
      {selectedEvent && (
        <Modal
          isOpen={inspectorOpen}
          onClose={() => setInspectorOpen(false)}
          title={`Audit Payload Inspector — ${selectedEvent.id}`}
        >
          <div className="space-y-4 text-xs">
            {/* Context Summary */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Action
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedEvent.action}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Resource
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedEvent.resourceType}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Actor
                </span>
                <span className="text-slate-700">
                  {selectedEvent.actorDisplayName || selectedEvent.actorUserId}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Timestamp
                </span>
                <span className="font-mono text-slate-600">
                  {formatDateTime(selectedEvent.timestamp)}
                </span>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative">
              <div className="flex items-center justify-between px-3 py-1.5 rounded-t-lg bg-slate-800 text-slate-200 font-mono text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-teal-400" /> Raw Audit
                  Event Document
                </span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 text-[10px] hover:text-white transition-colors"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-b-lg bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
                {JSON.stringify(selectedEvent, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInspectorOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
