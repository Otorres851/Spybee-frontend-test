"use client";

import { Moon, Sun } from "lucide-react";
import { useT } from "@/hooks/useT";
import { useUiStore } from "@/stores/useUiStore";
import styles from "./CommonControls.module.scss";

export function ThemeToggle() {
  const t = useT();
  const dark = useUiStore((state) => state.dark);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={styles.control}
      aria-label={dark ? t.themeLight : t.themeDark}
      title={dark ? t.themeLight : t.themeDark}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
