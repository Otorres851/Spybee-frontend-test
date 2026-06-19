"use client";

import { useMemo, useState } from "react";
import { Filter, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { IncidentsFiltersPanel } from "@/components/dashboard/IncidentsFiltersPanel";
import { CreateIncidentModal } from "@/components/incidents/CreateIncidentModal";
import { IncidentsMapCanvas } from "./IncidentsMapCanvas";
import { Button } from "@/components/ui/AppButton";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { useIncidents } from "@/hooks/useIncidents";
import { useT } from "@/hooks/useT";
import { useUiStore } from "@/stores/useUiStore";
import {
  buildDashboardModel,
  createInitialFilters,
  getPeriodDays,
  type DashboardFilters,
} from "@/utils/incidentAnalytics";

function getFilterOptions(incidents: ReturnType<typeof useIncidents>["incidents"]) {
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
}

/**
 * Full-screen map page used by the incidence creation workflow.
 */
export function IncidentsMapPage() {
  const t = useT();
  const setModal = useUiStore((s) => s.setModal);
  const { incidents } = useIncidents();
  const periodOptions = t.periodOptions.split("|");
  const [period, setPeriod] = useState(t.last30);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>(() => createInitialFilters(30));
  const [focusedVisit, setFocusedVisit] = useState<{ lat: number; lng: number; signal: number }>();
  const [bimComparison, setBimComparison] = useState(false);

  const filterOptions = useMemo(() => getFilterOptions(incidents), [incidents]);
  const filteredIncidents = useMemo(() => buildDashboardModel(incidents, filters).incidents, [filters, incidents]);
  const recentVisits = useMemo(() => {
    return [...filteredIncidents]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [filteredIncidents]);

  const handlePeriodChange = (nextPeriod: string) => {
    setPeriod(nextPeriod);
    setFilters((current) => ({ ...current, periodDays: getPeriodDays(nextPeriod) }));
  };

  return (
    <AppShell>
      <div className="relative p-2 sm:p-3 md:p-4">
        <div
          className={[
            "relative z-30 mb-3 grid max-w-full grid-cols-[3.5rem_minmax(0,1fr)_3.5rem] gap-2",
            "sm:flex sm:items-center sm:overflow-visible sm:pb-0",
            "xl:absolute xl:left-24 xl:top-7 xl:mb-0 xl:max-w-[calc(100%-10rem)]",
          ].join(" ")}
        >
          <div className="relative min-w-0 sm:shrink-0">
            <Button variant="ghost" onClick={() => setFiltersOpen((current) => !current)} aria-label={t.activeFilters}>
              <Filter size={18} />
              <span className="hidden sm:inline">{t.activeFilters}</span>
            </Button>
            <IncidentsFiltersPanel
              open={filtersOpen}
              period={period}
              filters={filters}
              companyOptions={filterOptions.companies}
              userOptions={filterOptions.users}
              onPeriodChange={handlePeriodChange}
              onApply={(nextFilters) => {
                setFilters(nextFilters);
                setFiltersOpen(false);
              }}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
          <div className="min-w-0 sm:w-auto sm:min-w-[16rem]">
            <SelectMenu
              ariaLabel={t.date}
              value={period}
              options={periodOptions}
              onChange={handlePeriodChange}
            />
          </div>
          <Button onClick={() => setModal(true)} aria-label={t.createIncidentAria}>
            <Plus size={18} />
            <span className="hidden sm:inline whitespace-nowrap">{t.create}</span>
          </Button>
          <div className="hidden xl:flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              className={[
                "min-h-11 shrink-0 px-4 text-sm",
                bimComparison ? "bg-bee-400 text-neutral-950 hover:bg-bee-400 dark:text-white" : "",
              ].join(" ")}
              onClick={() => setBimComparison((value) => !value)}
              aria-pressed={bimComparison}
            >
              <span className="whitespace-nowrap">{t.compareBim}</span>
            </Button>
            <div className="glass flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold shadow-card">
              <span className="whitespace-nowrap">{t.lastVisits}</span>
              <div className="flex items-center gap-1.5" aria-label={t.lastVisits}>
                {recentVisits.map((incident, index) => (
                  <button
                    key={incident.id}
                    type="button"
                    className={[
                      "size-2.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bee-400/70",
                      index === 0 ? "bg-bee-400" : "bg-black/25 hover:bg-bee-400 dark:bg-white/35 dark:hover:bg-bee-400",
                    ].join(" ")}
                    title={incident.title}
                    aria-label={`${t.lastVisits}: ${incident.title}`}
                    onClick={() =>
                      setFocusedVisit({
                        lat: incident.coordinates.lat,
                        lng: incident.coordinates.lng,
                        signal: Date.now(),
                      })
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          className={[
            "relative z-20 mb-3 flex max-w-full items-center gap-2 overflow-x-auto pb-1",
            "scrollbar-none xl:hidden",
          ].join(" ")}
        >
          <Button
            variant="ghost"
            className={[
              "min-h-11 shrink-0 px-4 text-sm",
              bimComparison ? "bg-bee-400 text-neutral-950 hover:bg-bee-400 dark:text-white" : "",
            ].join(" ")}
            onClick={() => setBimComparison((value) => !value)}
            aria-pressed={bimComparison}
          >
            <span className="whitespace-nowrap">{t.compareBim}</span>
          </Button>
          <div className="glass flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-bold shadow-card sm:px-4 sm:text-sm">
            <span className="whitespace-nowrap">{t.lastVisits}</span>
            <div className="flex items-center gap-1.5" aria-label={t.lastVisits}>
              {recentVisits.map((incident, index) => (
                <button
                  key={incident.id}
                  type="button"
                  className={[
                    "size-2.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bee-400/70",
                    index === 0 ? "bg-bee-400" : "bg-black/25 hover:bg-bee-400 dark:bg-white/35 dark:hover:bg-bee-400",
                  ].join(" ")}
                  title={incident.title}
                  aria-label={`${t.lastVisits}: ${incident.title}`}
                  onClick={() =>
                    setFocusedVisit({
                      lat: incident.coordinates.lat,
                      lng: incident.coordinates.lng,
                      signal: Date.now(),
                    })
                  }
                />
              ))}
            </div>
          </div>
        </div>
        <IncidentsMapCanvas incidents={filteredIncidents} focusLocation={focusedVisit} bimComparison={bimComparison} />
        <CreateIncidentModal />
      </div>
    </AppShell>
  );
}
