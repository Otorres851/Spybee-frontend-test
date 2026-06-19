import type { Incident } from "@/types/incident";

export function getMapIncidents(incidents: Incident[]) {
  return incidents.map((incident) => ({
    id: incident.id,
    title: incident.title,
    priority: incident.priority,
    status: incident.status,
    coordinates: incident.coordinates,
    locationDescription: incident.locationDescription,
  }));
}
