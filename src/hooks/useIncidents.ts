"use client";

import { useEffect, useMemo, useState } from "react";
import { incidents as fallbackIncidents } from "@/data/incidents";
import type { Incident } from "@/types/incident";
import { sortIncidentsBySequence } from "@/utils/incidentAnalytics";
import { useUiStore } from "@/stores/useUiStore";
import { getIncidents, hasRemoteIncidentsSource } from "@/services/incidentsService";

export function useIncidents() {
  const createdIncidents = useUiStore((state) => state.createdIncidents);
  const [remoteIncidents, setRemoteIncidents] = useState<Incident[]>(fallbackIncidents);
  const [loading, setLoading] = useState(hasRemoteIncidentsSource());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRemoteIncidentsSource()) {
      setRemoteIncidents(fallbackIncidents);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadIncidents() {
      try {
        setLoading(true);
        setError(null);
        const payload = await getIncidents();
        setRemoteIncidents(payload);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setRemoteIncidents(fallbackIncidents);
        setError(requestError instanceof Error ? requestError.message : "Unknown error");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadIncidents();

    return () => controller.abort();
  }, []);

  const incidents = useMemo(
    () => sortIncidentsBySequence([...createdIncidents, ...remoteIncidents]),
    [createdIncidents, remoteIncidents]
  );

  return { incidents, loading, error };
}
