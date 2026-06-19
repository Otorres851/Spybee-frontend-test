export const env = {
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "",
  incidentsMockUrl: process.env.NEXT_PUBLIC_INCIDENTS_MOCK_URL ?? "",
} as const;
