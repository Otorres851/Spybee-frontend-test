import { incidents as fallbackIncidents } from "@/data/incidents";
import type { Incident, Priority, Status } from "@/types/incident";

export type PeriodValue = 7 | 15 | 30 | 90 | 180;

export type DashboardFilters = {
  periodDays: PeriodValue;
  createdCompany: string;
  responsibleCompany: string;
  createdUser: string;
  responsibleUser: string;
};

export type KpiModel = {
  open: number;
  created: number;
  closed: number;
  closeRate: number;
  avgResolutionDays: number | null;
  overdueActive: number;
};

export type CountItem = {
  label: string;
  value: number;
};

export type TrendItem = {
  label: string;
  created: number;
  closed: number;
  backlog: number;
};

export type DashboardModel = {
  incidents: Incident[];
  allIncidents: Incident[];
  kpis: KpiModel;
  status: Record<Status, number>;
  priority: Record<Priority, number>;
  categories: CountItem[];
  tags: CountItem[];
  trend: TrendItem[];
  topResolvers: CountItem[];
  topReporters: CountItem[];
  workload: CountItem[];
  risk: {
    overdueToday: number;
    stale7d: number;
    highOpen: number;
    dueSoon7d: number;
  };
};

const TODAY = new Date();
const DAY_IN_MS = 1000 * 60 * 60 * 24;

function asDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function diffDays(a: Date, b: Date) {
  return Math.ceil((a.getTime() - b.getTime()) / DAY_IN_MS);
}

function normalizePriority(priority: unknown): Priority {
  return priority === "low" || priority === "medium" || priority === "high" ? priority : "medium";
}

function normalizeStatus(status: unknown): Status {
  return status === "closed" || status === "paused" || status === "open" ? status : "open";
}

function normalizeUser(user: any, fallbackName: string) {
  return {
    name: String(user?.name ?? fallbackName),
    email: String(user?.email ?? ""),
    avatarUrl: String(
      user?.avatarUrl ?? `https://i.pravatar.cc/80?u=${encodeURIComponent(fallbackName)}`
    ),
  };
}

export function normalizeIncident(raw: any, index = 0): Incident {
  const sequenceId = String(raw?.sequenceId ?? index + 1).padStart(4, "0");

  return {
    id: String(raw?.id ?? `incident-${sequenceId}`),
    sequenceId,
    title: String(raw?.title ?? "Incidencia sin título"),
    description: String(raw?.description ?? ""),
    type: {
      key: String(raw?.type?.key ?? raw?.type?.name ?? "general"),
      name: String(raw?.type?.name ?? "General"),
      name_en: raw?.type?.name_en ? String(raw.type.name_en) : undefined,
    },
    priority: normalizePriority(raw?.priority),
    status: normalizeStatus(raw?.status),
    coordinates: {
      lat: Number(raw?.coordinates?.lat ?? 4.65242),
      lng: Number(raw?.coordinates?.lng ?? -74.05846),
    },
    locationDescription: String(raw?.locationDescription ?? "Sin ubicación"),
    dueDate: raw?.dueDate ?? null,
    closingDate: raw?.closingDate ?? null,
    owner: normalizeUser(raw?.owner, "Usuario"),
    whatsappOwner: raw?.whatsappOwner ?? null,
    assignees: Array.isArray(raw?.assignees)
      ? raw.assignees.map((user: any, userIndex: number) =>
          normalizeUser(user, `Asignado ${userIndex + 1}`)
        )
      : [],
    observers: Array.isArray(raw?.observers)
      ? raw.observers.map((user: any, userIndex: number) =>
          normalizeUser(user, `Observador ${userIndex + 1}`)
        )
      : [],
    media: Array.isArray(raw?.media) ? raw.media : [],
    tags: Array.isArray(raw?.tags)
      ? raw.tags.map((tag: any) => ({
          id: String(tag?.id ?? tag?.name ?? String(Math.random())),
          name: String(tag?.name ?? "Etiqueta"),
          color: String(tag?.color ?? "#FFC400"),
        }))
      : [],
    project: raw?.project,
    approval: Boolean(raw?.approval),
    deleted: raw?.deleted ?? null,
    order: Number(raw?.order ?? index + 1),
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw?.updatedAt ?? new Date().toISOString()),
  };
}

export function sortIncidentsBySequence(incidents: Incident[]) {
  return [...incidents].sort((a, b) => {
    const sequenceA = Number(a.sequenceId) || a.order || 0;
    const sequenceB = Number(b.sequenceId) || b.order || 0;
    return sequenceA - sequenceB;
  });
}

export function normalizeIncidents(raw: unknown): Incident[] {
  return Array.isArray(raw)
    ? sortIncidentsBySequence(raw.map(normalizeIncident))
    : sortIncidentsBySequence(fallbackIncidents);
}

export function getPeriodDays(label: string): PeriodValue {
  if (/7/.test(label)) return 7;
  if (/15/.test(label)) return 15;
  if (/90/.test(label)) return 90;
  if (/6|month|meses/i.test(label)) return 180;
  return 30;
}

export function createInitialFilters(periodDays: PeriodValue = 30): DashboardFilters {
  return {
    periodDays,
    createdCompany: "",
    responsibleCompany: "",
    createdUser: "",
    responsibleUser: "",
  };
}

function normalizeText(value?: string | null) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesText(value: string | undefined, filter: string) {
  const normalizedFilter = normalizeText(filter);
  return !normalizedFilter || normalizeText(value).includes(normalizedFilter);
}

function getEmailCompany(email?: string) {
  const domain = email?.split("@")[1] ?? "";
  return normalizeText(domain.split(".")[0]);
}

function getKnownUserCompany(name?: string) {
  const normalized = name?.toLowerCase() ?? "";
  if (
    /(julian lozano|julian rico|demo late|juan sebastian|alejandro test|diego andrés|diego andres)/.test(
      normalized
    )
  ) {
    return "spybee";
  }
  return "constructora";
}

function getUserCompanyCandidates(user: { name?: string; email?: string }) {
  return [getEmailCompany(user.email), getKnownUserCompany(user.name)].filter(Boolean);
}

function companyMatches(candidates: string[], filter: string) {
  const normalizedFilter = normalizeText(filter);
  if (!normalizedFilter) return true;

  return candidates.some((candidate) => normalizeText(candidate).includes(normalizedFilter));
}

function getReferenceDate(incidents: Incident[]) {
  // Use real activity dates for the dashboard window. Due dates may be in the future and
  // should not move the period forward because that can make the mock data appear empty.
  const dates = incidents
    .flatMap((incident) => [incident.createdAt, incident.updatedAt, incident.closingDate])
    .map(asDate)
    .filter((date): date is Date => Boolean(date));

  if (dates.length === 0) return TODAY;

  const maxDate = new Date(Math.max(...dates.map((date) => date.getTime())));
  return maxDate > TODAY ? TODAY : maxDate;
}

function getPeriodStart(referenceDate: Date, periodDays: PeriodValue) {
  return new Date(referenceDate.getTime() - periodDays * DAY_IN_MS);
}

function isDateInRange(value: string | null | undefined, from: Date, to: Date) {
  const date = asDate(value);
  return Boolean(date && date >= from && date <= to);
}

function isIncidentActiveInPeriod(incident: Incident, from: Date, to: Date) {
  return (
    isDateInRange(incident.createdAt, from, to) ||
    isDateInRange(incident.updatedAt, from, to) ||
    isDateInRange(incident.closingDate, from, to)
  );
}

function filterByPeopleAndCompany(incidents: Incident[], filters: DashboardFilters) {
  return incidents.filter((incident) => {
    const ownerCompanies = getUserCompanyCandidates(incident.owner);
    const assigneeCompanies = incident.assignees.flatMap(getUserCompanyCandidates);
    const createdByCompany = companyMatches(ownerCompanies, filters.createdCompany);
    const responsibleByCompany = companyMatches(assigneeCompanies, filters.responsibleCompany);
    const createdByUser = includesText(incident.owner.name, filters.createdUser);
    const responsibleByUser =
      !filters.responsibleUser ||
      incident.assignees.some((assignee) => includesText(assignee.name, filters.responsibleUser));

    return createdByCompany && responsibleByCompany && createdByUser && responsibleByUser;
  });
}

export function filterIncidents(
  incidents: Incident[],
  filters: DashboardFilters,
  referenceDate = getReferenceDate(incidents)
) {
  const from = getPeriodStart(referenceDate, filters.periodDays);
  return filterByPeopleAndCompany(incidents, filters).filter((incident) =>
    isIncidentActiveInPeriod(incident, from, referenceDate)
  );
}

function countBy<T extends string>(items: Incident[], getKey: (incident: Incident) => T) {
  return items.reduce<Record<T, number>>(
    (acc, incident) => {
      const key = getKey(incident);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<T, number>
  );
}

function countItems(items: string[], limit = 8): CountItem[] {
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    if (!item) return acc;
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function getAvgResolutionDays(incidents: Incident[]) {
  const closed = incidents
    .map((incident) => {
      const createdAt = asDate(incident.createdAt);
      const closingDate = asDate(incident.closingDate);
      return createdAt && closingDate ? Math.max(0, diffDays(closingDate, createdAt)) : null;
    })
    .filter((value): value is number => value !== null);

  if (closed.length === 0) return null;
  const total = closed.reduce((sum, value) => sum + value, 0);
  return Number((total / closed.length).toFixed(1));
}

function getTrend(
  incidents: Incident[],
  periodDays: PeriodValue,
  referenceDate: Date
): TrendItem[] {
  const points = periodDays <= 15 ? 5 : periodDays <= 30 ? 6 : 8;
  const step = Math.max(1, Math.floor(periodDays / points));
  let backlog = 0;

  return Array.from({ length: points }, (_, index) => {
    const start = new Date(referenceDate.getTime() - (periodDays - step * index) * DAY_IN_MS);
    const end = new Date(start.getTime() + step * DAY_IN_MS);
    const created = incidents.filter((incident) => {
      const date = asDate(incident.createdAt);
      return date && date >= start && date < end;
    }).length;
    const closed = incidents.filter((incident) => {
      const date = asDate(incident.closingDate);
      return date && date >= start && date < end;
    }).length;
    backlog += created - closed;

    return {
      label: start.toLocaleDateString("es-CO", { month: "short", day: "2-digit" }),
      created,
      closed,
      backlog: Math.max(0, backlog),
    };
  });
}

export function buildDashboardModel(
  incidents: Incident[],
  filters: DashboardFilters
): DashboardModel {
  const sortedAll = sortIncidentsBySequence(incidents);
  const referenceDate = getReferenceDate(sortedAll);
  const from = getPeriodStart(referenceDate, filters.periodDays);
  const filtered = filterIncidents(sortedAll, filters, referenceDate);
  const dimensionFiltered = filterByPeopleAndCompany(sortedAll, filters);
  const filteredActive = filtered.filter((incident) => incident.status !== "closed");
  const created = dimensionFiltered.filter((incident) =>
    isDateInRange(incident.createdAt, from, referenceDate)
  ).length;
  const closed = dimensionFiltered.filter((incident) =>
    isDateInRange(incident.closingDate, from, referenceDate)
  ).length;
  const open = filteredActive.length;
  const overdueActive = filteredActive.filter((incident) => {
    const due = asDate(incident.dueDate);
    return due ? due < referenceDate : false;
  }).length;
  const stale7d = filteredActive.filter((incident) => {
    const updated = asDate(incident.updatedAt);
    return updated ? diffDays(referenceDate, updated) >= 7 : false;
  }).length;
  const highOpen = filteredActive.filter((incident) => incident.priority === "high").length;
  const dueSoon7d = filteredActive.filter((incident) => {
    const due = asDate(incident.dueDate);
    return due ? due >= referenceDate && diffDays(due, referenceDate) <= 7 : false;
  }).length;
  const statusCounts = countBy(filtered, (incident) => incident.status);
  const priorityCounts = countBy(filtered, (incident) => incident.priority);
  const status = {
    open: statusCounts.open ?? 0,
    paused: statusCounts.paused ?? 0,
    closed: statusCounts.closed ?? 0,
  } as Record<Status, number>;
  const priority = {
    low: priorityCounts.low ?? 0,
    medium: priorityCounts.medium ?? 0,
    high: priorityCounts.high ?? 0,
  } as Record<Priority, number>;

  return {
    incidents: filtered,
    allIncidents: sortedAll,
    kpis: {
      open,
      created,
      closed,
      closeRate: created > 0 ? Math.round((closed / created) * 100) : 0,
      avgResolutionDays: getAvgResolutionDays(filtered),
      overdueActive,
    },
    status,
    priority,
    categories: countItems(
      filtered.map((incident) => incident.type.name),
      8
    ),
    tags: countItems(
      filtered.flatMap((incident) => incident.tags.map((tag) => tag.name)),
      8
    ),
    trend: getTrend(filtered, filters.periodDays, referenceDate),
    topResolvers: countItems(
      filtered.flatMap((incident) =>
        incident.status === "closed" ? incident.assignees.map((assignee) => assignee.name) : []
      ),
      5
    ),
    topReporters: countItems(
      filtered.map((incident) => incident.owner.name),
      6
    ),
    workload: countItems(
      filteredActive.flatMap((incident) => incident.assignees.map((assignee) => assignee.name)),
      6
    ),
    risk: {
      overdueToday: overdueActive,
      stale7d,
      highOpen,
      dueSoon7d,
    },
  };
}

export function getOverdueLabel(incident: Incident, fallback: string, prefix: string) {
  const due = asDate(incident.dueDate);
  if (!due) return fallback;
  if (due >= TODAY) return due.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  return `${prefix} ${diffDays(TODAY, due)}d`;
}
