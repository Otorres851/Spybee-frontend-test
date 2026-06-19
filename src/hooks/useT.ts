"use client";

import { dict, type DictKey, type TranslationDictionary } from "@/i18n";
import { useUiStore } from "@/stores/useUiStore";

/**
 * Returns the active translation dictionary.
 *
 * The proxy keeps components safe during refactors: if a key is missing,
 * the key name is returned instead of breaking the render.
 */
export function useT() {
  const lang = useUiStore((state) => state.lang);
  const messages = dict[lang] as TranslationDictionary;

  return new Proxy(messages, {
    get(target, prop: string) {
      return target[prop as DictKey] ?? prop;
    },
  }) as TranslationDictionary;
}
