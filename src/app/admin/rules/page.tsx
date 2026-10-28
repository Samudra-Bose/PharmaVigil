"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { ClinicalRuleSet, ClinicalRule } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import {
  BookOpenCheck,
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  BookMarked,
  Layers,
  Scale,
  Sparkles,
  Info,
} from "lucide-react";

export default function AdminRulesPage() {
  const { role } = useAuth();
  const [ruleSet, setRuleSet] = useState<ClinicalRuleSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadRuleSet() {
      try {
        setLoading(true);
        const data = await api.getCurrentRuleSet();
        setRuleSet(data);
      } catch (err) {
        console.error("Failed to load clinical ruleset", err);
      } finally {
        setLoading(false);
      }
    }
    loadRuleSet();
  }, []);

  const categoryCounts = useMemo(() => {
    if (!ruleSet?.rules) return { ddi: 0, dose: 0, allergy: 0, dup: 0 };
    return {
      ddi: ruleSet.rules.filter((r) => r.category === "DDI").length,
      dose: ruleSet.rules.filter((r) => r.category === "DOSE_RANGE").length,
      allergy: ruleSet.rules.filter(
        (r) => r.category === "ALLERGY_CROSS_REACTIVITY",
      ).length,
      dup: ruleSet.rules.filter((r) => r.category === "DUPLICATE_THERAPY")
        .length,
    };
  }, [ruleSet]);

  const filteredRules = useMemo(() => {
    if (!ruleSet?.rules) return [];
    return ruleSet.rules.filter((r) => {
      if (categoryFilter !== "ALL" && r.category !== categoryFilter)
        return false;
      if (severityFilter !== "ALL" && r.severity !== severityFilter)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.ruleId.toLowerCase().includes(q) ||
          r.name?.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.recommendation.toLowerCase().includes(q) ||
          r.targetIngredients?.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [ruleSet, categoryFilter, severityFilter, searchQuery]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="critical">CRITICAL</Badge>;
      case "HIGH":
        return <Badge variant="critical">HIGH</Badge>;
      case "MODERATE":
        return <Badge variant="moderate">MODERATE</Badge>;
      case "LOW":
        return <Badge variant="info">LOW</Badge>;
      default:
        return <Badge variant="neutral">{severity}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "DDI":
        return "Drug-Drug Interaction";
      case "DOSE_RANGE":
        return "Dose Range Check";
      case "ALLERGY_CROSS_REACTIVITY":
        return "Allergy Cross-Reactivity";
      case "DUPLICATE_THERAPY":
        return "Duplicate Therapy";
      default:
        return category;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Published CDS Clinical Rulesets Explorer
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {ruleSet?.ruleCount || 0} active rules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic clinical decision support knowledge base, safety
            thresholds, and validation monograph citations.
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="text-xs gap-1.5">
          <Link href="/admin">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Governance
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !ruleSet ? (
        <EmptyState
          title="No ruleset loaded"
          description="Could not load the active clinical ruleset metadata."
        />
      ) : (
        <>
          {/* Ruleset Summary & Validation Warning */}
          <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {ruleSet.ruleSetId}
                  </span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {ruleSet.version}
                  </span>
                  <Badge variant="authorized">{ruleSet.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {ruleSet.description}
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                <span className="block font-medium text-slate-700">
                  {ruleSet.publishedBy || "Indian Pharmacopoeia Commission"}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Published:{" "}
                  {ruleSet.publishedAt
                    ? new Date(ruleSet.publishedAt).toLocaleDateString()
                    : "Active"}
                </span>
              </div>
            </div>

            {/* Validation Callout */}
            <div className="p-3 rounded-md bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 block">
                  Illustrative Demonstration Ruleset — Not Clinically Validated
                </span>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Rules in this active version are illustrative demonstration
                  rulesets for software testing; they are not clinically
                  validated for diagnostic, prescriptive, or unverified
                  treatment decisions. Independent clinician verification is
                  mandatory prior to dispensing.
                </p>
              </div>
            </div>

            {/* Explicit Clinical Limitations */}
            {ruleSet.limitations && ruleSet.limitations.length > 0 && (
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Explicit Clinical Boundaries & Limitations:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                  {ruleSet.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Category Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() =>
                setCategoryFilter(categoryFilter === "DDI" ? "ALL" : "DDI")
              }
              className={`p-3 rounded-lg border text-left transition-all ${
                categoryFilter === "DDI"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block ${categoryFilter === "DDI" ? "text-slate-300" : "text-slate-400"}`}
              >
                Drug-Drug Interactions
              </span>
              <span className="text-xl font-bold mt-1 block">
                {categoryCounts.ddi} Rules
              </span>
            </button>

            <button
              onClick={() =>
                setCategoryFilter(
                  categoryFilter === "DOSE_RANGE" ? "ALL" : "DOSE_RANGE",
                )
              }
              className={`p-3 rounded-lg border text-left transition-all ${
                categoryFilter === "DOSE_RANGE"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block ${categoryFilter === "DOSE_RANGE" ? "text-slate-300" : "text-slate-400"}`}
              >
                Dose Range Checks
              </span>
              <span className="text-xl font-bold mt-1 block">
                {categoryCounts.dose} Rules
              </span>
            </button>

            <button
              onClick={() =>
                setCategoryFilter(
                  categoryFilter === "ALLERGY_CROSS_REACTIVITY"
                    ? "ALL"
                    : "ALLERGY_CROSS_REACTIVITY",
                )
              }
              className={`p-3 rounded-lg border text-left transition-all ${
                categoryFilter === "ALLERGY_CROSS_REACTIVITY"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block ${categoryFilter === "ALLERGY_CROSS_REACTIVITY" ? "text-slate-300" : "text-slate-400"}`}
              >
                Allergy Cross-Reactivity
              </span>
              <span className="text-xl font-bold mt-1 block">
                {categoryCounts.allergy} Rules
              </span>
            </button>

            <button
              onClick={() =>
                setCategoryFilter(
                  categoryFilter === "DUPLICATE_THERAPY"
                    ? "ALL"
                    : "DUPLICATE_THERAPY",
                )
              }
              className={`p-3 rounded-lg border text-left transition-all ${
                categoryFilter === "DUPLICATE_THERAPY"
                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block ${categoryFilter === "DUPLICATE_THERAPY" ? "text-slate-300" : "text-slate-400"}`}
              >
                Duplicate Therapy
              </span>
              <span className="text-xl font-bold mt-1 block">
                {categoryCounts.dup} Rules
              </span>
            </button>
          </div>

          {/* Rules Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-600">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-7 px-2 text-xs rounded border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="ALL">All Categories</option>
                  <option value="DDI">Drug-Drug Interaction (DDI)</option>
                  <option value="DOSE_RANGE">Dose Range Check</option>
                  <option value="ALLERGY_CROSS_REACTIVITY">
                    Allergy Cross-Reactivity
                  </option>
                  <option value="DUPLICATE_THERAPY">Duplicate Therapy</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                <span className="font-semibold text-slate-600">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="h-7 px-2 text-xs rounded border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Search rule ID, drug, recommendation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-7"
              />
            </div>
          </div>

          {/* Rules Table */}
          {filteredRules.length === 0 ? (
            <EmptyState
              title="No clinical rules match"
              description="No rules match the current filter or search criteria."
              actionLabel="Clear Filters"
              onAction={() => {
                setCategoryFilter("ALL");
                setSeverityFilter("ALL");
                setSearchQuery("");
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredRules.map((rule) => (
                <div
                  key={rule.ruleId}
                  className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs space-y-2 text-xs"
                >
                  {/* Top Bar: Rule ID, Severity, Category */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {rule.ruleId}
                      </span>
                      {getSeverityBadge(rule.severity)}
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {getCategoryLabel(rule.category)}
                      </span>
                    </div>

                    {rule.guidelineReference && (
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <BookMarked className="w-3 h-3 text-teal-600" />
                        {rule.guidelineReference}
                      </span>
                    )}
                  </div>

                  {/* Name & Trigger Condition */}
                  <div>
                    {rule.name && (
                      <h3 className="font-bold text-slate-900 text-sm">
                        {rule.name}
                      </h3>
                    )}
                    {rule.triggerCondition && (
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        <strong>Trigger:</strong> {rule.triggerCondition}
                      </p>
                    )}
                    {rule.targetIngredients &&
                      rule.targetIngredients.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Target Ingredients:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {rule.targetIngredients.map((ing) => (
                              <span
                                key={ing}
                                className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200 font-medium"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Clinical Description & Mechanistic Rationale */}
                  <div className="p-3 rounded-md bg-slate-50/70 border border-slate-150 space-y-1">
                    <p className="text-slate-800 leading-relaxed">
                      {rule.description}
                    </p>
                    {rule.mechanisticRationale && (
                      <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                        <strong>Mechanism:</strong> {rule.mechanisticRationale}
                      </p>
                    )}
                  </div>

                  {/* Actionable Clinical Recommendation */}
                  <div className="p-2.5 rounded-md bg-emerald-50/60 border border-emerald-200/80 text-emerald-950 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[11px] text-emerald-900 uppercase tracking-wider mb-0.5">
                        Clinical Recommendation & Action:
                      </strong>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        {rule.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
