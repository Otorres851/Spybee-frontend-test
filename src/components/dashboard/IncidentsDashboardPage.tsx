"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CalendarDays,
  Download,
  Filter,
  LayoutGrid,
  List,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/AppButton";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { IncidentsKpiGrid } from "./IncidentsKpiGrid";
import { IncidentsDashboardSkeleton } from "./IncidentsDashboardSkeleton";
import { IncidentsFiltersPanel } from "./IncidentsFiltersPanel";
import { IncidentsDashboardCharts } from "@/components/dashboard/IncidentsDashboardCharts";
import { IncidentsMapCanvas } from "@/components/map/IncidentsMapCanvas";
import { CreateIncidentModal } from "@/components/incidents/CreateIncidentModal";
import { useIncidents } from "@/hooks/useIncidents";
import { useT } from "@/hooks/useT";
import { useUiStore } from "@/stores/useUiStore";
import {
  buildDashboardModel,
  createInitialFilters,
  getPeriodDays,
  type DashboardFilters,
} from "@/utils/incidentAnalytics";


function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getReferenceDate(incidents: ReturnType<typeof useIncidents>["incidents"]) {
  const dates = incidents
    .flatMap((incident) => [incident.createdAt, incident.updatedAt, incident.closingDate])
    .map(parseDate)
    .filter((date): date is Date => Boolean(date));

  if (dates.length === 0) return new Date();
  return new Date(Math.max(...dates.map((date) => date.getTime())));
}

function formatPeriodLabel(incidents: ReturnType<typeof useIncidents>["incidents"], days: number) {
  const end = getReferenceDate(incidents);
  const start = new Date(end.getTime() - days * 86_400_000);
  const formatter = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" });
  return `${formatter.format(start)} a ${formatter.format(end)}`.replaceAll(".", "");
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= count ? new Date(year, month, day) : null;
  });
}

/**
 * Main dashboard screen. It fetches the mock JSON, applies filters and hydrates all widgets.
 */
export function IncidentsDashboardPage() {
  const [loadingUi, setLoadingUi] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const t = useT();
  const setModal = useUiStore((state) => state.setModal);
  const { incidents, loading: loadingData } = useIncidents();
  const days = t.days.split(" ");
  const periodOptions = t.periodOptions.split("|");
  const [period, setPeriod] = useState(t.last30);
  const [filters, setFilters] = useState<DashboardFilters>(() => createInitialFilters(30));
  const [calendarDate, setCalendarDate] = useState(() => new Date(2026, 5, 10));
  const [calendarPickerOpen, setCalendarPickerOpen] = useState(false);

  useEffect(() => {
    setFilters((current) => ({ ...current, periodDays: getPeriodDays(period) }));
  }, [period]);

  const model = useMemo(() => buildDashboardModel(incidents, filters), [incidents, filters]);
  const periodLabel = useMemo(() => formatPeriodLabel(incidents, filters.periodDays), [incidents, filters.periodDays]);
  const calendarDays = useMemo(() => buildCalendarDays(calendarDate), [calendarDate]);
  const filterOptions = useMemo(() => {
    const userNames = incidents.flatMap((incident) => [
      incident.owner.name,
      ...incident.assignees.map((assignee) => assignee.name),
      ...(incident.observers ?? []).map((observer) => observer.name),
    ]);
    const companyNames = incidents.flatMap((incident) => [
      incident.owner.email?.split("@")[1]?.split(".")[0],
      ...incident.assignees.map((assignee) => assignee.email?.split("@")[1]?.split(".")[0]),
    ]);

    const keepString = (value: string | undefined): value is string => Boolean(value);

    return {
      users: Array.from(new Set(userNames.filter(keepString))).sort((a, b) => a.localeCompare(b, "es")),
      companies: Array.from(new Set(companyNames.filter(keepString))).sort((a, b) => a.localeCompare(b, "es")),
    };
  }, [incidents]);
  const activity = [
    [t.created, String(model.kpis.created), "calendar-status calendar-status--created"],
    [t.closed, String(model.kpis.closed), "calendar-status calendar-status--closed"],
    [t.overdue, String(model.risk.overdueToday), "calendar-status calendar-status--overdue"],
  ];

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-dashboard-loading");
    root.classList.remove("is-app-ready");

    const id = window.setTimeout(() => {
      setLoadingUi(false);
      root.classList.remove("is-dashboard-loading");
      root.classList.add("is-app-ready");
    }, 650);

    return () => {
      window.clearTimeout(id);
      root.classList.remove("is-dashboard-loading");
    };
  }, []);

  if (loadingUi || loadingData) return <IncidentsDashboardSkeleton />;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1920px] px-3 py-4 sm:px-4 md:px-6 md:py-7 xl:px-8">
        <div className="mb-5 grid gap-4 lg:mb-7 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[var(--muted)] sm:text-sm md:text-base">
              {t.breadcrumbs}
            </p>
            <h1 className="mt-2 text-4xl font-black leading-tight tracking-[-.055em] sm:text-5xl md:text-6xl">
              {t.incidents}
            </h1>
          </div>
          <div className="relative z-40 flex max-w-full flex-wrap gap-2 overflow-visible pb-1">
            <SelectMenu
              ariaLabel={period}
              value={period}
              options={periodOptions}
              onChange={setPeriod}
            />
            <div className="relative shrink-0">
              <Button variant="ghost" onClick={() => setFiltersOpen((current) => !current)}>
                <Filter size={18} />
                <span className="hidden sm:inline">{t.activeFilters}</span>
              </Button>
              <IncidentsFiltersPanel
                open={filtersOpen}
                period={period}
                filters={filters}
                companyOptions={filterOptions.companies}
                userOptions={filterOptions.users}
                onPeriodChange={setPeriod}
                onApply={(nextFilters) => {
                  setFilters(nextFilters);
                  setFiltersOpen(false);
                }}
                onClose={() => setFiltersOpen(false)}
              />
            </div>
            <Button variant="soft">
              <LayoutGrid size={18} />
            </Button>
            <Button variant="ghost">
              <List size={18} />
            </Button>
            <Button variant="ghost">
              <Download size={18} />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button variant="ghost">
              <span className="whitespace-nowrap">{t.reports}</span>
            </Button>
            <Button onClick={() => setModal(true)}>
              <Plus size={18} />
              <span className="whitespace-nowrap">{t.create}</span>
            </Button>
          </div>
        </div>

        <section className="space-y-5 md:space-y-6">
          <div className="min-w-0 space-y-4 md:space-y-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-xl font-black tracking-[-.03em] md:text-2xl">
                {t.summary}{" "}
                <span className="block text-sm text-[var(--muted)] sm:inline md:text-base">
                  ({t.period})
                </span>
              </h2>
              <p className="max-w-2xl text-sm font-semibold text-[var(--muted)]">{t.geographic}</p>
            </div>
            <IncidentsKpiGrid kpis={model.kpis} />
          </div>

          <IncidentsDashboardCharts model={model} />

          <div
            id="calendar"
            className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]"
          >
            <div className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black tracking-[-.03em] md:text-2xl">
                    {t.incidentMap}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                    {t.mapboxSubtitle}
                  </p>
                </div>
                <span
                  className={[
                    "hidden rounded-full bg-bee-400/20 px-3 py-1 text-xs",
                    "font-black text-amber-700 dark:text-bee-400 sm:inline",
                  ].join(" ")}
                >
                  {t.heat}
                </span>
              </div>
              <IncidentsMapCanvas compact incidents={model.incidents} />
            </div>

            <aside className="premium-card grid gap-4 rounded-[1.75rem] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className={[
                      "mb-2 flex items-center gap-2 text-xs font-black uppercase",
                      "tracking-[.18em] text-[var(--muted)]",
                    ].join(" ")}
                  >
                    <CalendarDays size={16} />
                    {t.activity}
                  </div>
                  <h3 className="text-xl font-black tracking-[-.03em]">{calendarDate.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}</h3>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCalendarPickerOpen((current) => !current)}
                    className={[
                      "rounded-2xl bg-black/5 px-3 py-2 text-xs font-black",
                      "transition hover:bg-bee-400 hover:text-black dark:bg-white/10",
                    ].join(" ")}
                  >
                    {t.selectDate}
                  </button>
                  {calendarPickerOpen && (
                    <div className="calendar-month-popover">
                      {Array.from({ length: 6 }, (_, index) => new Date(2026, index, 1)).map((date) => (
                        <button
                          key={date.toISOString()}
                          type="button"
                          className={date.getMonth() === calendarDate.getMonth() ? "is-selected" : undefined}
                          onClick={() => {
                            setCalendarDate(date);
                            setCalendarPickerOpen(false);
                          }}
                        >
                          {date.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    ref={dateInputRef}
                    type="month"
                    min="2026-01"
                    max="2026-06"
                    value={`${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, "0")}`}
                    onChange={(event) => {
                      const [year, month] = event.target.value.split("-").map(Number);
                      if (year && month) setCalendarDate(new Date(year, Math.min(month - 1, 5), 1));
                    }}
                    className="sr-only"
                    aria-label={t.selectDate}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {activity.map(([label, value, color]) => (
                  <div
                    key={label}
                    className={[
                      "rounded-2xl border border-[var(--line)] bg-[var(--panel-2)]",
                      "p-3 transition hover:-translate-y-0.5",
                    ].join(" ")}
                  >
                    <span className={color} />
                    <b className="block text-lg leading-none">{value}</b>
                    <span className="mt-1 block truncate text-[11px] font-bold text-[var(--muted)]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.35rem] border border-[var(--line)] bg-[var(--panel-2)] p-3 sm:p-4">
                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] sm:gap-2 sm:text-xs">
                  {days.map((day) => (
                    <b key={day} className="pb-1 text-[var(--muted)]">
                      {day}
                    </b>
                  ))}
                  {calendarDays.map((date, index) => {
                    const sameDay = (value?: string | null) => {
                      const incidentDate = parseDate(value);
                      return Boolean(
                        date &&
                          incidentDate &&
                          incidentDate.getFullYear() === date.getFullYear() &&
                          incidentDate.getMonth() === date.getMonth() &&
                          incidentDate.getDate() === date.getDate()
                      );
                    };
                    const created = model.incidents.some((incident) => sameDay(incident.createdAt));
                    const closed = model.incidents.some((incident) => sameDay(incident.closingDate));
                    const overdue = model.incidents.some(
                      (incident) => incident.status !== "closed" && sameDay(incident.dueDate)
                    );
                    const statusClass = overdue
                      ? "calendar-day--overdue"
                      : closed
                        ? "calendar-day--closed"
                        : created
                          ? "calendar-day--created"
                          : "calendar-day--idle";

                    return (
                      <button
                        key={index}
                        type="button"
                        disabled={!date}
                        data-active={created || closed || overdue}
                        title={date ? date.toLocaleDateString("es-CO") : undefined}
                        className={[
                          "calendar-day aspect-square min-h-8 rounded-xl text-xs",
                          "font-black transition hover:scale-105 sm:min-h-9",
                          !date ? "calendar-day--empty" : statusClass,
                        ].join(" ")}
                      >
                        {date?.getDate() ?? ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2">
                {[
                  [t.created, model.kpis.created],
                  [t.closed, model.kpis.closed],
                  [t.overdue, model.risk.overdueToday],
                ].map(([label, value], index) => (
                  <div
                    key={String(label)}
                    className={[
                      "group flex items-center gap-3 rounded-2xl border",
                      "border-[var(--line)] bg-[var(--panel-2)] p-3 transition",
                      "hover:border-bee-400/40",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid size-9 place-items-center rounded-xl bg-bee-400/20",
                        "text-amber-700 transition group-hover:bg-bee-400",
                        "group-hover:text-black dark:text-bee-400",
                      ].join(" ")}
                    >
                      {index === 1 ? <CheckCircle2 size={17} /> : <Activity size={17} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="block truncate text-sm">{label}</b>
                      <p className="truncate text-xs text-[var(--muted)]">{periodLabel}</p>
                    </div>
                    <b>{String(value)}</b>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>
      <CreateIncidentModal />
    </AppShell>
  );
}
