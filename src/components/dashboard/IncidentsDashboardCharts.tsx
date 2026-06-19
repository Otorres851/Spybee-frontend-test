"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Card } from "@/components/ui/AppCard";
import { useT } from "@/hooks/useT";
import type { DashboardModel, CountItem } from "@/utils/incidentAnalytics";
import { getOverdueLabel } from "@/utils/incidentAnalytics";
import type { Incident } from "@/types/incident";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers3,
  MoreVertical,
  Radar,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from "lucide-react";

type IncidentsDashboardChartsProps = {
  model: DashboardModel;
};

const defaultCategories = [
  "Estructural",
  "Hidrosanitario",
  "Materiales",
  "Urbanismo",
  "Eléctrico",
  "Arquitectónico",
  "Estabilidad",
  "Riesgos",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function RadarChart({ items }: { items: CountItem[] }) {
  const labels = items.length > 0 ? items.map((item) => item.label) : defaultCategories;
  const values = items.length > 0 ? items.map((item) => item.value) : [4, 2, 2, 1, 1, 1, 1, 1];
  const maxValue = Math.max(...values, 1);
  const cx = 240;
  const cy = 178;
  const r = 86;
  const labelR = 146;
  const points = values.map((value, index) => {
    const rr = clamp(value / maxValue, 0.18, 1) * r;
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;

    return {
      x: cx + Math.cos(angle) * rr,
      y: cy + Math.sin(angle) * rr,
    };
  });
  const axes = labels.map((label, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / labels.length;
    const labelX = cx + Math.cos(angle) * labelR;

    return {
      label,
      x: Math.min(430, Math.max(50, labelX)),
      y: Math.min(310, Math.max(36, cy + Math.sin(angle) * labelR)),
      gx: cx + Math.cos(angle) * r,
      gy: cy + Math.sin(angle) * r,
      angle,
      anchor: (labelX < cx - 16 ? "end" : labelX > cx + 16 ? "start" : "middle") as
        | "end"
        | "start"
        | "middle",
    };
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="radar-shell">
      <svg
        viewBox="0 0 480 340"
        role="img"
        aria-label={labels.join(", ")}
        className="h-full w-full"
      >
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={axes
              .map(
                (axis) =>
                  `${cx + Math.cos(axis.angle) * r * scale},${cy + Math.sin(axis.angle) * r * scale}`
              )
              .join(" ")}
            className="radar-grid"
          />
        ))}
        {axes.map((axis) => (
          <line key={axis.label} x1={cx} y1={cy} x2={axis.gx} y2={axis.gy} className="radar-axis" />
        ))}
        <polygon points={polygon} className="radar-fill" />
        <polygon points={polygon} className="radar-stroke" />
        {axes.map((axis, index) => (
          <g key={axis.label} className="radar-point-group">
            <text
              x={axis.x}
              y={axis.y}
              textAnchor={axis.anchor}
              dominantBaseline="middle"
              className="radar-label"
            >
              {axis.label}
            </text>
            <circle cx={points[index].x} cy={points[index].y} r="6" className="radar-dot" />
          </g>
        ))}
        <circle cx={cx} cy={cy} r="4" className="radar-center" />
      </svg>
    </div>
  );
}

function MultiDonutChart({
  label,
  total,
  segments,
}: {
  label: string;
  total: number;
  segments: Array<{ value: number; color: string }>;
}) {
  let cursor = 0;
  const gradient = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const start = total > 0 ? (cursor / total) * 100 : 0;
      cursor += segment.value;
      const end = total > 0 ? (cursor / total) * 100 : 0;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="summary-donut-card">
      <div
        className="summary-donut summary-donut--multi"
        style={{ "--segments": gradient || "var(--muted) 0 100%" } as CSSProperties}
      >
        <div>
          <b>{total}</b>
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
}

function StatusPriorityPanel({ model }: IncidentsDashboardChartsProps) {
  const t = useT();
  const statusTotal = model.status.open + model.status.closed + model.status.paused;
  const priorityTotal = model.priority.high + model.priority.medium + model.priority.low;

  return (
    <div className="grid-full grid gap-4 lg:grid-cols-2">
      <Card className="premium-card donut-panel p-4 sm:p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-black tracking-[-.03em]">{t.byStatus}</h3>
          <b className="text-xl font-black">{statusTotal}</b>
        </div>
        <div className="donut-panel-layout">
          <MultiDonutChart
            label={t.total}
            total={statusTotal}
            segments={[
              { value: model.status.open, color: "var(--green)" },
              { value: model.status.closed, color: "var(--danger)" },
              { value: model.status.paused, color: "var(--orange)" },
            ]}
          />
          <div className="donut-legend-list">
            <div>
              <span className="donut-dot donut-dot--green" />
              {t.opened}
              <b>{model.status.open}</b>
            </div>
            <div>
              <span className="donut-dot donut-dot--danger" />
              {t.closedLabel}
              <b>{model.status.closed}</b>
            </div>
            <div>
              <span className="donut-dot donut-dot--orange" />
              {t.paused}
              <b>{model.status.paused}</b>
            </div>
          </div>
        </div>
      </Card>
      <Card className="premium-card donut-panel p-4 sm:p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-black tracking-[-.03em]">{t.byPriority}</h3>
          <b className="text-xl font-black">{priorityTotal}</b>
        </div>
        <div className="donut-panel-layout">
          <MultiDonutChart
            label={t.total}
            total={priorityTotal}
            segments={[
              { value: model.priority.high, color: "var(--danger)" },
              { value: model.priority.medium, color: "var(--orange)" },
              { value: model.priority.low, color: "var(--green)" },
            ]}
          />
          <div className="donut-legend-list">
            <div>
              <span className="donut-dot donut-dot--danger" />
              {t.high}
              <b>{model.priority.high}</b>
            </div>
            <div>
              <span className="donut-dot donut-dot--orange" />
              {t.medium}
              <b>{model.priority.medium}</b>
            </div>
            <div>
              <span className="donut-dot donut-dot--green" />
              {t.low}
              <b>{model.priority.low}</b>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

type TrendGranularity = "day" | "week" | "month";

function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTrendLabel(date: Date, granularity: TrendGranularity) {
  if (granularity === "month") {
    return date.toLocaleDateString("es-CO", { month: "short" });
  }
  return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

function buildTrendByGranularity(incidents: Incident[], granularity: TrendGranularity) {
  const dates = incidents
    .flatMap((incident) => [incident.createdAt, incident.closingDate])
    .map(toDate)
    .filter((date): date is Date => Boolean(date));

  if (dates.length === 0) return [];

  const maxDate = new Date(Math.max(...dates.map((date) => date.getTime())));
  const bucketCount = granularity === "day" ? 10 : granularity === "week" ? 6 : 6;
  const stepDays = granularity === "day" ? 1 : granularity === "week" ? 7 : 30;
  let backlog = 0;

  return Array.from({ length: bucketCount }, (_, index) => {
    const start = new Date(maxDate.getTime() - (bucketCount - 1 - index) * stepDays * 86_400_000);
    const end = new Date(start.getTime() + stepDays * 86_400_000);
    const created = incidents.filter((incident) => {
      const date = toDate(incident.createdAt);
      return date && date >= start && date < end;
    }).length;
    const closed = incidents.filter((incident) => {
      const date = toDate(incident.closingDate);
      return date && date >= start && date < end;
    }).length;
    backlog += created - closed;

    return {
      label: formatTrendLabel(start, granularity),
      created,
      closed,
      backlog: Math.max(0, backlog),
    };
  });
}

function TrendPanel({ model }: IncidentsDashboardChartsProps) {
  const t = useT();
  const [granularity, setGranularity] = useState<TrendGranularity>("week");
  const trend = useMemo(
    () => buildTrendByGranularity(model.incidents, granularity),
    [model.incidents, granularity]
  );
  const trendItems = trend.length > 0 ? trend : model.trend;
  const maxValue = Math.max(
    ...trendItems.flatMap((item) => [item.created, item.closed, item.backlog]),
    1
  );
  const areaPoints = trendItems
    .map((item, index) => {
      const x = (index / Math.max(1, trendItems.length - 1)) * 1000;
      const y = 230 - (item.backlog / maxValue) * 190;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className="premium-card chart-card grid-full min-w-0 overflow-hidden p-0">
      <div
        className={[
          "flex flex-col gap-4 border-b border-[var(--line)] p-4",
          "sm:flex-row sm:items-start sm:justify-between sm:p-5 md:p-6",
        ].join(" ")}
      >
        <div className="min-w-0">
          <div className="eyebrow text-orange-500">
            <TrendingUp size={16} />
            {t.risk}
          </div>
          <h3 className="mt-2 text-xl font-black leading-tight tracking-[-.035em] md:text-2xl">
            {t.trendTitle}
          </h3>
          <p className="mt-1 max-w-2xl text-sm font-semibold text-[var(--muted)]">
            {t.trendSubtitle}
          </p>
        </div>
        <div
          className={[
            "flex w-max shrink-0 items-center gap-1 rounded-2xl border",
            "border-[var(--line)] bg-[var(--panel-2)] p-1 text-xs",
            "font-black sm:text-sm",
          ].join(" ")}
        >
          {(
            [
              ["day", t.day],
              ["week", t.week],
              ["month", t.month],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setGranularity(value)}
              className={[
                "rounded-xl px-3 py-2 transition",
                granularity === value
                  ? "bg-[var(--panel)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]",
              ].join(" ")}
              aria-pressed={granularity === value}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="trend-board">
        <div className="trend-grid-lines" />
        <svg className="trend-area" viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="areaBee" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--bee)" stopOpacity=".28" />
              <stop offset="100%" stopColor="var(--bee)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,260 ${areaPoints} 1000,260`} fill="url(#areaBee)" />
          <polyline points={areaPoints} className="trend-stroke" fill="none" />
        </svg>
        <div className="trend-bars">
          {trendItems.map((item, index) => (
            <div key={`${item.label}-${index}`} className="trend-col group">
              <div className="trend-stack">
                <span className="trend-tooltip">{item.created}</span>
                <i
                  className="bar-created"
                  style={{ height: `${Math.max(8, (item.created / maxValue) * 100)}%` }}
                />
                <i
                  className="bar-closed"
                  style={{ height: `${Math.max(4, (item.closed / maxValue) * 100)}%` }}
                />
              </div>
              <b>{index % 2 === 0 ? item.label : ""}</b>
            </div>
          ))}
        </div>
        <div className="legend-row">
          <span>
            <i className="bg-orange-500" />
            {t.backlog}
          </span>
          <span>
            <i className="legend-created" />
            {t.created}
          </span>
          <span>
            <i className="legend-closed" />
            {t.closed}
          </span>
        </div>
      </div>
    </Card>
  );
}

function DistributionPanel({ model }: IncidentsDashboardChartsProps) {
  const t = useT();
  const tags =
    model.tags.length > 0 ? model.tags : [{ label: "Sin etiqueta", value: model.incidents.length }];
  const palette = [
    "treemap-yellow",
    "treemap-blue",
    "treemap-green",
    "treemap-blue",
    "treemap-yellow",
  ];

  return (
    <div className="grid-full min-w-0">
      <div className="section-title">
        <h2>{t.detailedDistribution}</h2>
        <span>{t.distributionSubtitle}</span>
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
        <Card className="premium-card min-w-0 p-4 sm:p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow text-bee-600 dark:text-bee-400">
                <Radar size={15} />
                {t.category}
              </div>
              <h3 className="mt-2 text-xl font-black tracking-[-.03em]">{t.byCategory}</h3>
            </div>
            <span
              className={[
                "rounded-full bg-bee-400/15 px-3 py-1.5 text-xs font-black",
                "text-amber-700 dark:text-bee-400",
              ].join(" ")}
            >
              {model.incidents.length}
            </span>
          </div>
          <RadarChart items={model.categories} />
        </Card>
        <Card className="premium-card professional-panel min-w-0 p-4 sm:p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow text-blue-500">
                <Layers3 size={15} />
                {t.tags}
              </div>
              <h3 className="mt-2 text-xl font-black tracking-[-.03em]">{t.byTag}</h3>
            </div>
            <button
              className={[
                "grid size-10 shrink-0 place-items-center rounded-2xl",
                "bg-black/5 transition hover:scale-105 dark:bg-white/10",
              ].join(" ")}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="treemap-grid">
            {tags.slice(0, 5).map((tag, index) => (
              <div
                key={tag.label}
                className={[
                  "treemap-block",
                  palette[index % palette.length],
                  index === 0 ? "treemap-tall" : "",
                  index === 2 ? "treemap-wide" : "",
                ].join(" ")}
              >
                <strong>{tag.label}</strong>
                <b>{tag.value}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function TeamPanel({ model }: IncidentsDashboardChartsProps) {
  const t = useT();
  const maxWorkload = Math.max(...model.workload.map((item) => item.value), 1);
  const maxReporter = Math.max(...model.topReporters.map((item) => item.value), 1);
  const resolver = model.topResolvers[0];

  return (
    <div className="grid-full min-w-0">
      <div className="section-title">
        <h2>{t.teamPerformance}</h2>
        <span>{t.teamPerformanceSubtitle}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="premium-card p-4 sm:p-5">
          <div className="eyebrow text-green-500">
            <ShieldCheck size={15} />
            {t.resolvers}
          </div>
          <h3 className="mt-2 text-lg font-black">{t.topResolver}</h3>
          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{t.closedAndAvgTime}</p>
          <div className="mt-7 flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?u=resolver"
              className="size-10 rounded-2xl"
              alt=""
            />
            <b className="min-w-0 flex-1 truncate">{resolver?.label ?? "—"}</b>
            <div className="h-3 flex-[1.4] overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <span className="block h-full w-full rounded-full bg-green-500" />
            </div>
            <span className="font-black text-green-500">{resolver?.value ?? 0}</span>
          </div>
        </Card>
        <Card className="premium-card p-4 sm:p-5">
          <div className="eyebrow text-bee-600 dark:text-bee-400">
            <UsersRound size={15} />
            {t.reporters}
          </div>
          <h3 className="mt-2 text-lg font-black">{t.topReporters}</h3>
          <div className="mt-5 grid gap-3">
            {model.topReporters.slice(0, 4).map((item) => (
              <div key={item.label} className="workload-row">
                <span>{item.label}</span>
                <i>
                  <b
                    className="workload-fill workload-fill--bee"
                    style={{ width: `${Math.max(8, (item.value / maxReporter) * 100)}%` }}
                  />
                </i>
                <strong className="text-orange-500">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card className="premium-card p-4 sm:p-5">
          <div className="eyebrow text-blue-500">
            <Flame size={15} />
            {t.workload}
          </div>
          <h3 className="mt-2 text-lg font-black">{t.currentWorkload}</h3>
          <div className="mt-5 grid gap-3">
            {model.workload.map((item) => (
              <div key={item.label} className="workload-row">
                <span>{item.label}</span>
                <i>
                  <b
                    className="workload-fill workload-fill--blue"
                    style={{ width: `${Math.max(8, (item.value / maxWorkload) * 100)}%` }}
                  />
                </i>
                <strong className="text-blue-500">{item.value}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function IncidentTableRow({ incident }: { incident: Incident }) {
  const t = useT();

  return (
    <tr
      className={[
        "border-b border-[var(--line)] last:border-0",
        "hover:bg-black/[.025] dark:hover:bg-white/[.035]",
      ].join(" ")}
    >
      <td className="px-5 py-4 font-black">#{incident.sequenceId}</td>
      <td className="max-w-[360px] px-5 py-4">
        <b className="line-clamp-1">{incident.title}</b>
        <p className="mt-1 line-clamp-1 text-xs text-[var(--muted)]">
          {incident.locationDescription}
        </p>
      </td>
      <td className="px-5 py-4">
        <span
          className={[
            "badge",
            incident.priority === "high"
              ? "badge-red"
              : incident.priority === "medium"
                ? "badge-orange"
                : "badge-green",
          ].join(" ")}
        >
          {incident.priority === "high"
            ? t.high
            : incident.priority === "medium"
              ? t.medium
              : t.low}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={[
            "badge",
            incident.status === "open"
              ? "badge-green"
              : incident.status === "closed"
                ? "badge-red"
                : "badge-orange",
          ].join(" ")}
        >
          {incident.status === "open"
            ? t.opened
            : incident.status === "closed"
              ? t.closedLabel
              : t.paused}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex -space-x-2">
          {incident.assignees.slice(0, 4).map((assignee) => (
            <img
              key={assignee.name}
              src={assignee.avatarUrl}
              className="size-8 rounded-full border-2 border-white dark:border-[var(--panel)]"
              alt=""
            />
          ))}
        </div>
      </td>
      <td className="px-5 py-4 text-[var(--muted)] font-bold">{incident.owner.name || "—"}</td>
      <td className="px-5 py-4">
        <span className="badge badge-red">
          {getOverdueLabel(incident, t.noDate, t.overdueSince)}
        </span>
      </td>
      <td className="px-5 py-4">
        <button className="grid size-9 place-items-center rounded-xl bg-black/5 dark:bg-white/10">
          <MoreVertical size={16} />
        </button>
      </td>
    </tr>
  );
}

function CriticalPanel({ model }: IncidentsDashboardChartsProps) {
  const t = useT();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const tableIncidents = model.incidents;
  const totalPages = Math.max(1, Math.ceil(tableIncidents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const rows = tableIncidents.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [tableIncidents]);

  return (
    <Card className="premium-card grid-full min-w-0 overflow-hidden p-0">
      <div
        className={[
          "flex flex-col gap-3 border-b border-[var(--line)] p-4",
          "sm:flex-row sm:items-center sm:justify-between sm:p-5 md:p-6",
        ].join(" ")}
      >
        <div>
          <div className="eyebrow text-red-500">
            <AlertTriangle size={16} />
            {t.currentStatus}
          </div>
          <h3 className="mt-2 text-xl font-black tracking-[-.03em] md:text-2xl">{t.critical}</h3>
          <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{t.criticalSubtitle}</p>
        </div>
        <div className="risk-chip">
          <CalendarClock size={17} />
          <span>
            {tableIncidents.length} {t.total.toLowerCase()}
          </span>
        </div>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-black/5 text-xs uppercase tracking-[.08em] text-[var(--muted)] dark:bg-white/10">
            <tr>
              {[
                t.id,
                t.tableTitle,
                t.tablePriority,
                t.status,
                t.assignees,
                t.createdBy,
                t.expiration,
                "",
              ].map((heading) => (
                <th key={heading || "actions"} className="px-5 py-4">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((incident) => (
              <IncidentTableRow key={incident.id} incident={incident} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-4 md:hidden">
        {rows.slice(0, 5).map((incident) => (
          <article
            key={incident.id}
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <h4 className="line-clamp-2 font-black">{incident.title}</h4>
              <ArrowUpRight size={16} />
            </div>
            <p className="text-xs font-bold text-[var(--muted)]">
              #{incident.sequenceId} · {incident.locationDescription}
            </p>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--line)] px-4 py-3 sm:px-5">
        <span className="mr-2 text-sm font-black text-[var(--muted)]">
          {start + 1}-{Math.min(start + pageSize, tableIncidents.length)} de {tableIncidents.length}
        </span>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-xl border border-[var(--line)]"
          disabled={currentPage === 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => index + 1).map((item) => (
          <button
            key={item}
            type="button"
            className={`grid size-9 place-items-center rounded-xl border border-[var(--line)] font-black ${currentPage === item ? "bg-bee-400 text-black" : ""}`}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        ))}
        {totalPages > 5 && <span className="px-1 font-black text-[var(--muted)]">...</span>}
        {totalPages > 5 && (
          <button
            type="button"
            className="grid size-9 place-items-center rounded-xl border border-[var(--line)] font-black"
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </button>
        )}
        <button
          type="button"
          className="grid size-9 place-items-center rounded-xl border border-[var(--line)]"
          disabled={currentPage === totalPages}
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </Card>
  );
}

/** Dashboard visualization panels. All metrics react to fetched data and active filters. */
export function IncidentsDashboardCharts({ model }: IncidentsDashboardChartsProps) {
  return (
    <div id="risk" className="dashboard-grid">
      <StatusPriorityPanel model={model} />
      <TrendPanel model={model} />
      <DistributionPanel model={model} />
      <TeamPanel model={model} />
      <CriticalPanel model={model} />
    </div>
  );
}
