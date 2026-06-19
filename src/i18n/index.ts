import { en } from "./en";
import { es } from "./es";

export const dict = {
  es,
  en,
} as const;

export type Lang = keyof typeof dict;
export type Locale = Lang;
export type DictKey = keyof typeof es;
export type TranslationDictionary = Record<DictKey, string>;

export const DEFAULT_LANG: Lang = "es";
export const LANG_OPTIONS: Lang[] = ["es", "en"];
