"use client";

import { useT } from "@/hooks/useT";
import { useIncidents } from "@/hooks/useIncidents";
import { useUiStore } from "@/stores/useUiStore";
import { AlertTriangle, ImageIcon, Layers, LocateFixed, Plus, Ruler, Share2, Building2, Maximize2 } from "lucide-react";
import type mapboxgl from "mapbox-gl";
import type { Incident } from "@/types/incident";
import { useCallback, useEffect, useRef, useState } from "react";

type IncidentsMapCanvasProps = {
  compact?: boolean;
  picker?: boolean;
  incidents?: Incident[];
  focusLocation?: { lat: number; lng: number; signal: number };
  bimComparison?: boolean;
  onPick?: (location: { lat: number; lng: number }) => void;
};

type MapboxLayerProps = {
  compact: boolean;
  zoomSignal: number;
  centerSignal: number;
  mapStyle: string;
  is3d: boolean;
  picker: boolean;
  onPick?: (location: { lat: number; lng: number }) => void;
  onCreate: (location?: { lat: number; lng: number }) => void;
  onUnavailable: () => void;
  incidents?: Incident[];
  focusLocation?: { lat: number; lng: number; signal: number };
};

/** Guards the Mapbox fallback so invalid placeholder tokens never mount the map. */
function isValidMapboxToken(token?: string) {
  return Boolean(token && token.startsWith("pk.") && !token.includes("tu_token"));
}

function MapUnavailable({ compact, t, incidents = [] }: { compact: boolean; t: ReturnType<typeof useT>; incidents?: Incident[] }) {
  return (
    <div className="absolute inset-0 map-unavailable">
      <div className="map-unavailable__grid" />
      {incidents.slice(0, 80).map((incident) => {
        const left = 50 + (incident.coordinates.lng + 74.0582) * 13000;
        const top = 50 - (incident.coordinates.lat - 4.6526) * 13000;
        return (
          <span
            key={incident.id}
            className="map-unavailable__pin"
            style={{ left: `${Math.max(8, Math.min(92, left))}%`, top: `${Math.max(8, Math.min(92, top))}%` }}
            title={incident.title}
          >
            !
          </span>
        );
      })}
      <div className="map-unavailable__card">
        <span className="map-unavailable__icon">
          <AlertTriangle size={22} />
        </span>
        <h3>{t.mapUnavailableTitle}</h3>
        <p>{t.mapUnavailableDescription}</p>
        {!compact && <code>NEXT_PUBLIC_MAPBOX_TOKEN=pk.tu_token_real</code>}
      </div>
    </div>
  );
}

function MapboxLayer({
  compact,
  zoomSignal,
  centerSignal,
  mapStyle,
  is3d,
  picker,
  onPick,
  onCreate,
  onUnavailable,
  incidents: filteredIncidents,
  focusLocation,
}: MapboxLayerProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapboxRef = useRef<typeof mapboxgl | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const { incidents: storeIncidents } = useIncidents();
  const incidents = filteredIncidents ?? storeIncidents;

  useEffect(() => {
    let mounted = true;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!isValidMapboxToken(token)) {
      onUnavailable();
      return;
    }

    if (!containerRef.current) {
      onUnavailable();
      return;
    }

    void import("mapbox-gl")
      .then((module) => {
        if (!mounted || !containerRef.current) return;

        const mapbox = module.default;
        mapboxRef.current = mapbox;
        mapbox.accessToken = token;

        const map = new mapbox.Map({
          container: containerRef.current,
          style: mapStyle,
          center: [-74.0582, 4.6526],
          zoom: compact ? 15.6 : 15.35,
          pitch: 0,
          bearing: -18,
          attributionControl: true,
          logoPosition: "bottom-right",
        });

        mapRef.current = map;

        map.on("load", () => {
          setMapReady(true);
          map.resize();

          window.requestAnimationFrame(() => {
            map.resize();
          });

          setTimeout(() => {
            map.resize();
          }, 300);
        });

        map.on("error", () => {
          onUnavailable();
        });

        map.on("click", (event) => {
          const location = {
            lat: event.lngLat.lat,
            lng: event.lngLat.lng,
          };

          if (picker) {
            onPick?.(location);
            return;
          }

          onCreate(location);
        });
      })
      .catch(() => {
        onUnavailable();
      });

    return () => {
      mounted = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [compact, mapStyle, onCreate, onPick, onUnavailable, picker]);

  useEffect(() => {
    const map = mapRef.current;
    const mapbox = mapboxRef.current;

    if (!map || !mapbox || !mapReady) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    incidents.forEach((incident) => {
      const element = document.createElement("button");
      element.className = "mapbox-incident-marker";
      element.type = "button";
      element.setAttribute("aria-label", incident.title);
      element.innerHTML = "!";
      element.addEventListener("click", (event) => event.stopPropagation());

      const marker = new mapbox.Marker(element)
        .setLngLat([incident.coordinates.lng, incident.coordinates.lat])
        .setPopup(
          new mapbox.Popup({ offset: 18, closeButton: false }).setHTML(
            `<strong>${incident.title}</strong><p>${incident.locationDescription}</p>`
          )
        )
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [incidents, mapReady]);

  useEffect(() => {
    if (!mapRef.current || zoomSignal === 0) return;

    if (zoomSignal > 0) {
      mapRef.current.zoomIn();
    }

    if (zoomSignal < 0) {
      mapRef.current.zoomOut();
    }
  }, [zoomSignal]);

  useEffect(() => {
    if (!mapRef.current || centerSignal === 0) return;

    mapRef.current.flyTo({
      center: [-74.0582, 4.6526],
      zoom: compact ? 15.6 : 15.35,
      bearing: -18,
      pitch: is3d ? 58 : 0,
      essential: true,
    });
  }, [centerSignal, compact, is3d]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    mapRef.current.easeTo({
      pitch: is3d ? 58 : 0,
      bearing: is3d ? -24 : -18,
      duration: 500,
    });
  }, [is3d, mapReady]);


  useEffect(() => {
    if (!mapRef.current || !mapReady || !focusLocation || focusLocation.signal === 0) return;

    mapRef.current.flyTo({
      center: [focusLocation.lng, focusLocation.lat],
      zoom: compact ? 16.2 : 16,
      bearing: -18,
      pitch: is3d ? 58 : 0,
      essential: true,
    });
  }, [compact, focusLocation, is3d, mapReady]);

  return <div ref={containerRef} className="mapbox-canvas-root absolute inset-0 h-full w-full" />;
}

/**
 * Mapbox GL canvas with graceful fallback when the public token is missing.
 */
export function IncidentsMapCanvas({ compact = false, picker = false, incidents, focusLocation, bimComparison = false, onPick }: IncidentsMapCanvasProps) {
  const t = useT();
  const [zoomSignal, setZoomSignal] = useState(0);
  const [centerSignal, setCenterSignal] = useState(0);
  const [is3d, setIs3d] = useState(false);
  const [mapLayer, setMapLayer] = useState<"default" | "satellite">("default");
  const [mapUnavailable, setMapUnavailable] = useState(false);
  const setModal = useUiStore((state) => state.setModal);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const dark = useUiStore((state) => state.dark);
  const mapStyle = mapLayer === "satellite"
    ? "mapbox://styles/mapbox/satellite-streets-v12"
    : dark
      ? "mapbox://styles/mapbox/dark-v11"
      : "mapbox://styles/mapbox/streets-v12";
  const canRenderMapbox = isValidMapboxToken(token) && !mapUnavailable;

  const heightClass = compact
    ? "h-[520px] min-h-[520px] sm:h-[580px] sm:min-h-[580px] xl:h-[640px] xl:min-h-[640px]"
    : "h-[calc(100svh-178px)] min-h-[380px] sm:h-[calc(100svh-116px)] sm:min-h-[520px] md:h-[calc(100svh-108px)]";

  const handleCreate = useCallback(
    (location?: { lat: number; lng: number }) => {
      if (picker) {
        if (location) onPick?.(location);
        return;
      }

      setModal(true, location ?? { lat: 4.65242, lng: -74.05846 });
    },
    [onPick, picker, setModal]
  );

  const handleUnavailable = useCallback(() => {
    setMapUnavailable(true);
  }, []);

  return (
    <div
      className={[
        "relative overflow-hidden rounded-[1.35rem]",
        "border border-[var(--line)] shadow-card sm:rounded-[2rem]",
        heightClass,
      ].join(" ")}
    >
      {canRenderMapbox ? (
        <MapboxLayer
          compact={compact}
          zoomSignal={zoomSignal}
          centerSignal={centerSignal}
          mapStyle={mapStyle}
          is3d={is3d}
          picker={picker}
          onPick={onPick}
          onCreate={handleCreate}
          onUnavailable={handleUnavailable}
          incidents={incidents}
          focusLocation={focusLocation}
        />
      ) : (
        <MapUnavailable compact={compact} t={t} incidents={incidents} />
      )}

      {!picker && bimComparison && (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/2 border-r-2 border-bee-400/80 bg-bee-400/10 backdrop-saturate-150">
          <span className="absolute left-3 top-3 rounded-full bg-bee-400 px-3 py-1 text-xs font-black text-black shadow-card">
            BIM
          </span>
        </div>
      )}

      {!picker && (
        <div
          className={[
            "absolute right-2 top-3 z-20 flex max-h-[calc(100%-6.5rem)] flex-col overflow-y-auto",
            "rounded-[1.4rem] border border-[var(--line)] bg-[var(--panel)]/92 p-1.5 shadow-card backdrop-blur-xl",
            "dark:bg-slate-950/86 sm:right-5 sm:top-1/2 sm:-translate-y-1/2 sm:rounded-[2rem] sm:p-2.5",
          ].join(" ")}
        >
          <button
            className={[
              "grid size-11 place-items-center rounded-xl bg-bee-400 text-black shadow-sm sm:size-12",
              "transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bee-400/60",
            ].join(" ")}
            onClick={() => handleCreate()}
            aria-label={t.createIncidentAria}
            title={t.createIncidentAria}
          >
            <Plus size={26} strokeWidth={2.2} />
          </button>

          <button
            className="map-tool-button mt-2 sm:mt-3"
            onClick={() => setIs3d((value) => !value)}
            aria-label={is3d ? t.view2d : t.view3d}
            title={is3d ? t.view2d : t.view3d}
          >
            <Building2 size={21} />
          </button>

          <button
            className="map-tool-button"
            onClick={() => setZoomSignal((value) => (value <= 0 ? 1 : value + 1))}
            aria-label={t.focusMap}
            title={t.focusMap}
          >
            <Maximize2 size={20} />
          </button>

          <button
            className="map-tool-button"
            onClick={() => setMapLayer((value) => (value === "default" ? "satellite" : "default"))}
            aria-label={t.mapLayers}
            title={t.mapLayers}
          >
            <Layers size={21} />
          </button>

          <button
            className="map-tool-button"
            onClick={() => setCenterSignal((value) => value + 1)}
            aria-label={t.centerMap}
            title={t.centerMap}
          >
            <LocateFixed size={21} />
          </button>

          <span className="my-2 h-px w-8 self-center bg-[var(--line)] sm:my-3 sm:w-9" />

          <button
            className="map-tool-button"
            onClick={() => setMapLayer((value) => (value === "satellite" ? "default" : "satellite"))}
            aria-label={t.imageLayer}
            title={t.imageLayer}
          >
            <ImageIcon size={21} />
          </button>

          <button
            className="map-tool-button"
            onClick={() => setIs3d((value) => !value)}
            aria-label={t.measureMap}
            title={t.measureMap}
          >
            <Ruler size={21} />
          </button>

          <button
            className="map-tool-button"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            aria-label={t.share}
            title={t.share}
          >
            <Share2 size={21} />
          </button>
        </div>
      )}

      {!picker && (
        <div
          className={[
            "absolute bottom-3 left-1/2 z-20 hidden max-w-[calc(100%-1rem)] sm:flex",
            "-translate-x-1/2 items-center gap-1 rounded-2xl",
            "bg-[var(--panel)] p-1.5 shadow-card sm:p-2 md:gap-2",
          ].join(" ")}
        >
          <button
            className={["rounded-xl px-3 py-2 text-sm font-black md:px-5", !is3d ? "bg-bee-400 text-black" : ""].join(" ")}
            onClick={() => setIs3d(false)}
          >
            2D
          </button>
          <button
            className={["rounded-xl px-3 py-2 text-sm font-black md:px-5", is3d ? "bg-bee-400 text-black" : ""].join(" ")}
            onClick={() => setIs3d(true)}
          >
            3D
          </button>
          <span className="mx-1 hidden font-bold sm:inline">360°</span>
          <span className="h-5 w-10 rounded-full bg-black/20 dark:bg-white/20" />
        </div>
      )}

      <div
        className={[
          "absolute bottom-4 right-5 hidden text-right text-xs",
          "font-black text-black/60 dark:text-white/50 md:block",
        ].join(" ")}
      >
        Spybee
        <br />
        <span className="font-medium">© Mapbox © OpenStreetMap</span>
      </div>
    </div>
  );
}
