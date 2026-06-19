"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "@/i18n";
import type { Incident } from "@/types/incident";

type DraftLocation = {
  lat: number;
  lng: number;
};

type UiState = {
  lang: Lang;
  dark: boolean;
  modal: boolean;
  mobileNav: boolean;
  draftLocation: DraftLocation | null;
  createdIncidents: Incident[];
  setLang: (lang: Lang) => void;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
  setModal: (modal: boolean, location?: DraftLocation | null) => void;
  setMobileNav: (mobileNav: boolean) => void;
  addIncident: (incident: Incident) => void;
};

/**
 * Central UI state. Zustand keeps language, theme, navigation and the incident draft flow
 * available without prop drilling across dashboard and map screens.
 */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      lang: "es",
      dark: false,
      modal: false,
      mobileNav: false,
      draftLocation: null,
      createdIncidents: [],
      setLang: (lang) => set({ lang }),
      toggleTheme: () => set((state) => ({ dark: !state.dark })),
      setTheme: (dark) => set({ dark }),
      setModal: (modal, location) =>
        set((state) => ({
          modal,
          draftLocation: location === undefined ? state.draftLocation : location,
        })),
      setMobileNav: (mobileNav) => set({ mobileNav }),
      addIncident: (incident) =>
        set((state) => ({
          createdIncidents: [incident, ...state.createdIncidents],
        })),
    }),
    {
      name: "spybee-ui-store",
      partialize: (state) => ({
        lang: state.lang,
        dark: state.dark,
        createdIncidents: state.createdIncidents,
      }),
    }
  )
);
