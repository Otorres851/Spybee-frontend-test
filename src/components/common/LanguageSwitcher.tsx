"use client";

import { ChevronDown, Globe2 } from "lucide-react";
import { useT } from "@/hooks/useT";
import { useUiStore } from "@/stores/useUiStore";
import styles from "./CommonControls.module.scss";

export function LanguageSwitcher() {
  const t = useT();
  const { lang, setLang } = useUiStore();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      className={`${styles.control} ${styles.language}`}
      aria-label={t.changeLanguage}
    >
      <Globe2 size={15} />
      {lang === "es" ? "ES" : "EN"}
      <ChevronDown size={14} />
    </button>
  );
}
