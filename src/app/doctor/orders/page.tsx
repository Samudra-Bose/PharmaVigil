"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { InpatientMedicationOrder, MedicationOrderStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import {
  ListOrdered,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Building,
  User,
  Pill,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PauseCircle,
} from "lucide-react";

export default function DoctorOrdersPage() {
  const router = useRouter();
  const { role } = useAuth();
  const [orders, setOrders] = useState<InpatientMedicationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<InpatientMedicationOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listMedicationOrders({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setOrders(data);
    } catch (err) {
      console.error("Failed to load medication orders", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.patientId.toLowerCase().includes(q) ||
        o.patientName?.toLowerCase().includes(q) ||
        o.items.some(
          (i) =>
            i.canonicalIngredientIds?.some((c) => c.toLowerCase().includes(q)) ||
            i.brandName?.toLowerCase().includes(q)
        )
    );
  }, [orders, searchQuery]);

  const getStatusBadge = (status: MedicationOrderStatus) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="authorized">ACTIVE</Badge>;
      case "HELD":
        return <Badge variant="moderate">HELD</Badge>;
      case "DISCONTINUED":
        return <Badge variant="neutral">DISCONTINUED</Badge>;
      case "CANCELLED":
        return <Badge variant="critical">CANCELLED</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <ListOrdered className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Inpatient Medication Orders Ledger
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hospital-scoped inpatient scheduled therapies, routes, dosages, and administration tracking.
          </p>
        </div>

        <Link href="/doctor/orders/new">
          <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> + Prescribe Inpatient Order
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {(["ALL", "ACTIVE", "HELD", "DISCONTINUED", "CANCELLED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search patient, ID, medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>
      </div>

      {/* Orders Content */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No inpatient orders found"
          description={
            searchQuery
              ? `No orders matching "${searchQuery}". Try adjusting your filters.`
              : "No medication orders found for the selected status."
          }
          actionLabel="+ Prescribe Order Now"
          onAction={() => router.push("/doctor/orders/new")}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order & Version</th>
                  <th className="py-3 px-4">Patient & Ward</th>
                  <th className="py-3 px-4">Medication & Dosage</th>
                  <th className="py-3 px-4">Schedule & Route</th>
                  <th className="py-3 px-4">Date Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order ID & Version */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{ord.id}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          v{ord.currentVersionNumber}
                        </span>
                        {ord.versions && ord.versions.length > 1 && (
                          <span className="text-[10px] text-teal-700">
                            ({ord.versions.length} revisions)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Patient & Ward */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {ord.patientName || "Unknown Patient"}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-[10px]">
                          {ord.patientId}
                        </span>
                        {ord.ward && <span>• {ord.ward}</span>}
                        {ord.bed && <span>({ord.bed})</span>}
                      </div>
                    </td>

                    {/* Medications */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="font-semibold text-slate-800">
                              {item.canonicalIngredientIds?.join(", ")}
                              {item.brandName && (
                                <span className="font-normal text-slate-500 ml-1">
                                  ({item.brandName})
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Dose: {item.dose} {item.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Schedule & Route */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-900">
                          {ord.scheduleFrequency || ord.items[0]?.frequency || "Q8H"}
                        </span>
                        <span className="text-[11px] text-teal-700 font-medium">
                          {ord.route || ord.items[0]?.route || "INTRAVENOUS"}
                        </span>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      <div>
                        Start:{" "}
                        <span className="text-slate-700 font-medium">
                          {ord.startDate ? new Date(ord.startDate).toLocaleDateString() : "Immediate"}
                        </span>
                      </div>
                      {ord.endDate && (
                        <div>
                          End:{" "}
                          <span className="text-slate-700 font-medium">
                            {new Date(ord.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">{getStatusBadge(ord.status)}</td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs gap-1 h-7"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setModalOpen(true);
                        }}
                      >
                        <Eye className="w-3 h-3" /> Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Schedule Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Inpatient Order Details — ${selectedOrder.id}`}
        >
          <div className="space-y-4 text-xs">
            {/* Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <div className="mt-0.5">{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient</span>
                <span className="font-semibold text-slate-900">
                  {selectedOrder.patientName} ({selectedOrder.patientId})
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ward / Bed</span>
                <span className="text-slate-700">
                  {selectedOrder.ward || "Inpatient"} — {selectedOrder.bed || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ordering Clinician</span>
                <span className="text-slate-700">
                  {selectedOrder.orderingDoctorName || "Dr. Arvind Patel, MD"}
                </span>
              </div>
            </div>

            {/* Prescribed Medications */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-teal-600" /> Prescribed Medications & Instructions
              </h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="p-3 rounded-md bg-white border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {item.canonicalIngredientIds?.join(" + ")}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {item.dose} {item.unit}
                      </span>
                    </div>
                    {item.brandName && (
                      <p className="text-slate-500">Commercial Brand: {item.brandName}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-600 pt-1">
                      <span><strong>Route:</strong> {item.route || selectedOrder.route}</span>
                      <span><strong>Frequency:</strong> {item.frequency || selectedOrder.scheduleFrequency}</span>
                      {item.duration && <span><strong>Duration:</strong> {item.duration}</span>}
                    </div>
                    {item.instructions && (
                      <div className="mt-1 p-2 rounded bg-slate-50 text-[11px] text-slate-700 border border-slate-150">
                        <strong>Specific Instructions:</strong> {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Rationale & Notes */}
            {selectedOrder.notes && (
              <div className="p-3 rounded-md bg-amber-50/60 border border-amber-200 text-amber-900">
                <strong className="block text-[11px] uppercase tracking-wider mb-0.5">Clinical Rationale & Notes:</strong>
                <p className="text-xs">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Version Lineage */}
            {selectedOrder.versions && selectedOrder.versions.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-600" /> Version Lineage (Immutable Audit)
                </h3>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedOrder.versions.map((v) => (
                    <div key={v.id} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold font-mono text-slate-900">Version {v.versionNumber}</span>
                        <span className="text-slate-500 ml-2">{v.changeReason || "Prescription authored"}</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[10px]">
                        {formatDateTime(v.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
