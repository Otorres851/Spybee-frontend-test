import { incidents as fallbackIncidents } from "@/data/incidents";
import { env } from "@/config/env";
import { axiosClient } from "@/api/httpClient";
import type { Incident } from "@/types/incident";
import { normalizeIncidents } from "@/utils/incidentAnalytics";

let cachedRemoteIncidents: Incident[] | null = null;
let pendingRemoteIncidents: Promise<Incident[]> | null = null;

export function getIncidents() {
  if (!env.incidentsMockUrl) {
    return Promise.resolve(fallbackIncidents);
  }

  if (cachedRemoteIncidents) {
    return Promise.resolve(cachedRemoteIncidents);
  }

  if (!pendingRemoteIncidents) {
    pendingRemoteIncidents = axiosClient
      .get<unknown>(env.incidentsMockUrl)
      .then((response) => {
        cachedRemoteIncidents = normalizeIncidents(response.data);
        return cachedRemoteIncidents;
      })
      .finally(() => {
        pendingRemoteIncidents = null;
      });
  }

  return pendingRemoteIncidents;
}

export function hasRemoteIncidentsSource() {
  return Boolean(env.incidentsMockUrl);
}
