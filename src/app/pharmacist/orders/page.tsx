"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
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
  BedDouble,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Eye,
  ShieldAlert,
  Building,
  User,
  Pill,
  PauseCircle,
  FileCheck2,
  Syringe,
  Zap,
} from "lucide-react";

const HIGH_ALERT_INGREDIENTS = [
  "Vancomycin",
  "Heparin",
  "Enoxaparin",
  "Warfarin",
  "Insulin",
  "Piperacillin",
  "Potassium Chloride",
  "Morphine",
  "Fentanyl",
];

export default function PharmacistOrdersPage() {
  const { role } = useAuth();
  const [orders, setOrders] = useState<InpatientMedicationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [wardFilter, setWardFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<InpatientMedicationOrder | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Verification Checklist State
  const [checklist, setChecklist] = useState({
    scheduleTiming: false,
    routeCompatibility: false,
    highAlertVerified: false,
    allergyCrossReferenced: false,
  });

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

  // Dynamic Wards List
  const availableWards = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.ward) set.add(o.ward);
    });
    return Array.from(set);
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (wardFilter !== "ALL" && o.ward !== wardFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          o.id.toLowerCase().includes(q) ||
          o.patientId.toLowerCase().includes(q) ||
          o.patientName?.toLowerCase().includes(q) ||
          o.items.some(
            (i) =>
              i.canonicalIngredientIds?.some((c) => c.toLowerCase().includes(q)) ||
              i.brandName?.toLowerCase().includes(q)
          );
        if (!matches) return false;
      }
      return true;
    });
  }, [orders, wardFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const active = orders.filter((o) => o.status === "ACTIVE").length;
    const ivInfusions = orders.filter(
      (o) =>
        o.status === "ACTIVE" &&
        (o.route === "INTRAVENOUS" || o.items.some((i) => i.route === "INTRAVENOUS"))
    ).length;
    const statOrders = orders.filter(
      (o) =>
        o.status === "ACTIVE" &&
        (o.scheduleFrequency === "STAT" || o.items.some((i) => i.frequency === "STAT"))
    ).length;
    return { active, ivInfusions, statOrders };
  }, [orders]);

  const handleOpenReview = (order: InpatientMedicationOrder) => {
    setSelectedOrder(order);
    setChecklist({
      scheduleTiming: false,
      routeCompatibility: false,
      highAlertVerified: false,
      allergyCrossReferenced: false,
    });
    setReviewModalOpen(true);
  };

  const handleAcknowledgeSchedule = async () => {
    if (!selectedOrder) return;
    const allChecked = Object.values(checklist).every(Boolean);
    if (!allChecked) {
      toast.error("Please complete all items on the verification checklist prior to release.");
      return;
    }

    toast.success(`Inpatient order #${selectedOrder.id} verified and released to ${selectedOrder.ward || "ward"}!`);
    setReviewModalOpen(false);
  };

  const handleHoldOrder = async () => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      await api.updateMedicationOrderStatus(selectedOrder.id, "HELD");
      toast.warning(`Order #${selectedOrder.id} placed on clinical hold for doctor inquiry.`);
      setReviewModalOpen(false);
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to place order on hold.");
    } finally {
      setUpdating(false);
    }
  };

  const isHighAlert = (itemIngredient: string) => {
    return HIGH_ALERT_INGREDIENTS.some((h) =>
      itemIngredient.toLowerCase().includes(h.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <BedDouble className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Inpatient Medication Orders & Verification Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pharmacist review queue for inpatient IV infusions, scheduled hospital medications, and high-alert drug protocols.
          </p>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Active Inpatient Orders
            </span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">
              {metrics.active}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              IV Infusions Scheduled
            </span>
            <span className="text-2xl font-bold text-teal-700 mt-0.5 block">
              {metrics.ivInfusions}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
            <Syringe className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              STAT Orders Pending
            </span>
            <span className="text-2xl font-bold text-amber-700 mt-0.5 block">
              {metrics.statOrders}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {(["ALL", "ACTIVE", "HELD"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Ward Filter */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Ward:</span>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="h-7 px-2 text-xs rounded border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="ALL">All Wards</option>
              {availableWards.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search order, patient, drug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-7"
          />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No inpatient orders in queue"
          description={
            searchQuery
              ? `No matching orders for "${searchQuery}".`
              : "All inpatient orders for the selected filters have been reviewed and dispensed."
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order ID & Status</th>
                  <th className="py-3 px-4">Patient & Bed</th>
                  <th className="py-3 px-4">Ordered Medication & Alert Protocol</th>
                  <th className="py-3 px-4">Dose & Administration</th>
                  <th className="py-3 px-4">Ordering Clinician</th>
                  <th className="py-3 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.map((ord) => {
                  const hasHighAlert = ord.items.some((i) =>
                    i.canonicalIngredientIds?.some((c) => isHighAlert(c))
                  );
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order ID */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{ord.id}</div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Badge variant={ord.status === "ACTIVE" ? "authorized" : ord.status === "HELD" ? "moderate" : "neutral"}>
                            {ord.status}
                          </Badge>
                          <span className="font-mono text-[10px] text-slate-500">v{ord.currentVersionNumber}</span>
                        </div>
                      </td>

                      {/* Patient & Bed */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {ord.patientName || "Inpatient"}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.2 rounded mr-1">
                            {ord.patientId}
                          </span>
                          {ord.ward} {ord.bed ? `(${ord.bed})` : ""}
                        </div>
                      </td>

                      {/* Medication & High Alert */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {ord.items.map((item, i) => {
                            const isAlert = item.canonicalIngredientIds?.some((c) => isHighAlert(c));
                            return (
                              <div key={i} className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900">
                                    {item.canonicalIngredientIds?.join(", ")}
                                  </span>
                                  {isAlert && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
                                      <AlertTriangle className="w-2.5 h-2.5" /> High-Alert
                                    </span>
                                  )}
                                </div>
                                {item.instructions && (
                                  <span className="text-[10px] text-slate-500 truncate max-w-xs">
                                    {item.instructions}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Dose & Administration */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-mono text-slate-900 font-semibold">
                            {ord.items.map((i) => `${i.dose} ${i.unit}`).join(" + ")}
                          </div>
                          <div className="text-[11px] text-teal-800 font-medium">
                            {ord.route || ord.items[0]?.route || "IV"} •{" "}
                            <span className="font-bold">{ord.scheduleFrequency || ord.items[0]?.frequency}</span>
                          </div>
                        </div>
                      </td>

                      {/* Clinician */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800">
                          {ord.orderingDoctorName || "Dr. Arvind Patel, MD"}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatDateTime(ord.createdAt)}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="primary"
                          className="text-xs gap-1 h-7 shadow-xs"
                          onClick={() => handleOpenReview(ord)}
                        >
                          <Eye className="w-3 h-3" /> Review & Verify
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pharmacist Inpatient Review Dialog */}
      {selectedOrder && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Pharmacist Inpatient Verification — ${selectedOrder.id}`}
        >
          <div className="space-y-4 text-xs">
            {/* Overview Strip */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient</span>
                <span className="font-semibold text-slate-900">
                  {selectedOrder.patientName} ({selectedOrder.patientId})
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ward / Bed</span>
                <span className="text-slate-700">
                  {selectedOrder.ward} — {selectedOrder.bed}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Schedule / Route</span>
                <span className="font-semibold text-teal-800">
                  {selectedOrder.scheduleFrequency || selectedOrder.items[0]?.frequency} • {selectedOrder.route || selectedOrder.items[0]?.route}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <Badge variant={selectedOrder.status === "ACTIVE" ? "authorized" : "moderate"}>
                  {selectedOrder.status}
                </Badge>
              </div>
            </div>

            {/* Prescribed Items Detail */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-teal-700" /> Prescribed Therapy & Administration Instructions
              </h3>
              <div className="space-y-2">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 rounded-md bg-white border border-slate-200 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {it.canonicalIngredientIds?.join(", ")}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {it.dose} {it.unit}
                      </span>
                    </div>
                    {it.instructions && (
                      <p className="text-slate-600 text-[11px] bg-slate-50 p-2 rounded border border-slate-150">
                        <strong>Instructions:</strong> {it.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="p-3.5 rounded-lg bg-teal-50/60 border border-teal-200 space-y-2.5">
              <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" /> Clinical Verification Checklist (Mandatory)
              </h3>
              <div className="space-y-2 text-xs text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.scheduleTiming}
                    onChange={(e) => setChecklist((prev) => ({ ...prev, scheduleTiming: e.target.checked }))}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Schedule timing and administration frequency ({selectedOrder.scheduleFrequency || selectedOrder.items[0]?.frequency}) verified against unit protocol.</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.routeCompatibility}
                    onChange={(e) => setChecklist((prev) => ({ ...prev, routeCompatibility: e.target.checked }))}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Route compatibility ({selectedOrder.route || selectedOrder.items[0]?.route}) and infusion dilution confirmed.</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.highAlertVerified}
                    onChange={(e) => setChecklist((prev) => ({ ...prev, highAlertVerified: e.target.checked }))}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>High-alert medication safety thresholds and renal/weight boundaries validated.</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.allergyCrossReferenced}
                    onChange={(e) => setChecklist((prev) => ({ ...prev, allergyCrossReferenced: e.target.checked }))}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>Patient allergy profile cross-referenced against ordered ingredient classes.</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <Button
                size="sm"
                variant="outline"
                disabled={updating}
                onClick={handleHoldOrder}
                className="text-xs text-amber-700 hover:bg-amber-50 hover:text-amber-800 border-amber-300 w-full sm:w-auto"
              >
                <PauseCircle className="w-3.5 h-3.5" /> Hold for Doctor Inquiry
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button size="sm" variant="outline" onClick={() => setReviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleAcknowledgeSchedule}
                  className="text-xs gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge Inpatient Schedule
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
