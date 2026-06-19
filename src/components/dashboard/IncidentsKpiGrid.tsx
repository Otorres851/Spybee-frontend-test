"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  Percent,
  PlusCircle,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/AppCard";
import { useT } from "@/hooks/useT";
import type { KpiModel } from "@/utils/incidentAnalytics";

type IncidentsKpiGridProps = {
  kpis: KpiModel;
};

function formatResolution(value: number | null) {
  return value === null ? "—" : `${value}d`;
}

/** KPI cards powered by the active dashboard dataset and filters. */
export function IncidentsKpiGrid({ kpis }: IncidentsKpiGridProps) {
  const t = useT();
  const items = [
    {
      label: t.open,
      value: kpis.open,
      sub: t.current,
      Icon: FolderOpen,
      tone: "green",
      delta: "+12.4%",
    },
    {
      label: t.created,
      value: kpis.created,
      sub: t.inPeriod,
      Icon: PlusCircle,
      tone: "blue",
      delta: "+3",
    },
    {
      label: t.closed,
      value: kpis.closed,
      sub: t.inPeriod,
      Icon: CheckCircle2,
      tone: "danger",
      delta: "0",
    },
    {
      label: t.closeRate,
      value: `${kpis.closeRate}%`,
      sub: t.closedCreated,
      Icon: Percent,
      tone: "bee",
      delta: "+4%",
    },
    {
      label: t.avgTime,
      value: formatResolution(kpis.avgResolutionDays),
      sub: t.daysAverage,
      Icon: Timer,
      tone: "blue",
      delta: "-1.2d",
    },
    {
      label: t.overdue,
      value: kpis.overdueActive,
      sub: t.currentStatus,
      Icon: AlertTriangle,
      tone: "danger",
      delta: t.risk,
    },
  ];

  return (
    <div className="summary-kpis grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map(({ label, value, sub, Icon, tone, delta }, index) => (
        <Card
          key={label}
          className={`premium-card metric-card metric-card--${tone} min-h-[132px] p-4`}
        >
          <div className="relative z-10 flex h-full flex-col justify-between gap-3 pl-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="metric-label text-xs font-black uppercase tracking-[.16em] text-[var(--muted)]">
                  {label}
                </p>
                <strong className="metric-card__value mt-2 block text-3xl font-black tracking-[-.05em] sm:text-4xl">
                  {value}
                </strong>
              </div>

              <span className="metric-icon grid size-12 shrink-0 place-items-center rounded-2xl">
                <Icon size={22} />
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 text-sm font-semibold leading-tight text-[var(--muted)]">
                {sub}
              </span>
              <span
                className={[
                  "metric-card__delta rounded-full border border-[var(--line)]",
                  "bg-[var(--panel-2)] px-2.5 py-1 text-[11px] font-black",
                ].join(" ")}
              >
                {index === 5 ? (
                  delta
                ) : (
                  <>
                    <TrendingUp className="mr-1 inline" size={12} />
                    {delta}
                  </>
                )}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <span className={`metric-card__progress metric-card__progress--${index}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
