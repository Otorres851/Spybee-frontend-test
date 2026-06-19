import { incidents } from "@/data/incidents";
import { buildDashboardModel, createInitialFilters } from "@/utils/incidentAnalytics";

export function getDashboardSummary() {
  const model = buildDashboardModel(incidents, createInitialFilters());

  return {
    kpis: model.kpis,
    incidents: model.incidents,
  };
}
