export function countOpenIncidents(incidents: Array<{ status: string }>) {
  return incidents.filter((incident) => incident.status === "open").length;
}
