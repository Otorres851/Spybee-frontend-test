"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import clsx from "clsx";
import { useT } from "@/hooks/useT";
import styles from "./SelectMenu.module.scss";

type SelectMenuProps = {
  ariaLabel: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  searchable?: boolean;
  placeholder?: string;
  size?: "md" | "lg";
};

/**
 * Generic accessible dropdown used across dashboard filters and map controls.
 */
export function SelectMenu({
  ariaLabel,
  options,
  value,
  onChange,
  searchable = false,
  placeholder,
  size = "md",
}: SelectMenuProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(value ?? options[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) setSelected(value);
  }, [value]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()));
  }, [options, query]);

  const handleSelect = (option: string) => {
    setSelected(option);
    onChange?.(option);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={clsx(styles.select, size === "lg" && styles.selectLarge)} ref={ref}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        className={clsx(styles.trigger, open && styles.triggerOpen)}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected}</span>
        <ChevronDown size={18} className={clsx(styles.chevron, open && styles.chevronOpen)} />
      </button>

      {open && (
        <div className={styles.menu} role="listbox">
          {searchable && (
            <label className={styles.searchBox}>
              <Search size={16} />
              <input
                autoFocus
                value={query}
                placeholder={placeholder ?? t.search}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label={t.clear}>
                  <X size={14} />
                </button>
              )}
            </label>
          )}
          <div className={styles.options}>
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected === option}
                className={clsx(styles.option, selected === option && styles.optionActive)}
                onClick={() => handleSelect(option)}
              >
                <span>{option}</span>
                {selected === option && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
