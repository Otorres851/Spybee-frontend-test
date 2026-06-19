"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/AppButton";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { useT } from "@/hooks/useT";
import {
  createInitialFilters,
  getPeriodDays,
  type DashboardFilters,
} from "@/utils/incidentAnalytics";

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
}

type IncidentsFiltersPanelProps = {
  open: boolean;
  period: string;
  filters: DashboardFilters;
  onPeriodChange: (period: string) => void;
  companyOptions?: string[];
  userOptions?: string[];
  onApply: (filters: DashboardFilters) => void;
  onClose: () => void;
};

/** Responsive dashboard filters popover with translated labels and reusable selects. */
export function IncidentsFiltersPanel({
  open,
  period,
  filters,
  companyOptions = ["constructora"],
  userOptions = [],
  onPeriodChange,
  onApply,
  onClose,
}: IncidentsFiltersPanelProps) {
  const t = useT();
  const periods = t.periodOptions.split("|");
  const companies = uniqueSorted(companyOptions);
  const users = uniqueSorted(userOptions);
  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    if (open) setDraftFilters(filters);
  }, [filters, open]);

  if (!open) return null;

  const updateDraft = (key: keyof DashboardFilters, value: DashboardFilters[keyof DashboardFilters]) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="filters-popover" role="dialog" aria-label={t.dashboardFilters}>
      <div className="filters-popover__header">
        <h3>{t.dashboardFilters}</h3>
        <button type="button" onClick={onClose} aria-label={t.closeFilters}>
          <X size={18} />
        </button>
      </div>

      <div className="filters-popover__period">
        <label>{t.filterPeriod}</label>
        <SelectMenu
          ariaLabel={t.filterPeriod}
          options={periods}
          value={period}
          onChange={(nextPeriod) => {
            onPeriodChange(nextPeriod);
            updateDraft("periodDays", getPeriodDays(nextPeriod));
          }}
          size="lg"
        />
      </div>

      <div className="filters-popover__grid">
        <SearchSelect
          label={t.createdByCompany}
          placeholder={t.allCompanies}
          value={draftFilters.createdCompany}
          options={companies}
          onChange={(value) => updateDraft("createdCompany", value)}
        />
        <SearchSelect
          label={t.responsibleCompany}
          placeholder={t.allCompanies}
          value={draftFilters.responsibleCompany}
          options={companies}
          onChange={(value) => updateDraft("responsibleCompany", value)}
        />
        <SearchSelect
          label={t.createdByUser}
          placeholder={t.allUsers}
          value={draftFilters.createdUser}
          options={users}
          onChange={(value) => updateDraft("createdUser", value)}
        />
        <SearchSelect
          label={t.responsibleUser}
          placeholder={t.allUsers}
          value={draftFilters.responsibleUser}
          options={users}
          onChange={(value) => updateDraft("responsibleUser", value)}
        />
      </div>

      <div className="filters-popover__actions">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            const cleanFilters = createInitialFilters(getPeriodDays(t.last30));
            setDraftFilters(cleanFilters);
            onPeriodChange(t.last30);
            onApply(cleanFilters);
          }}
        >
          {t.clear}
        </Button>
        <Button type="button" onClick={() => onApply(draftFilters)}>
          {t.apply}
        </Button>
      </div>
    </div>
  );
}

type SearchSelectProps = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

function SearchSelect({ label, placeholder, value, options, onChange }: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const fieldRef = useRef<HTMLDivElement>(null);
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className="filter-field" ref={fieldRef}>
      <label>{label}</label>
      <button
        type="button"
        className={`filter-field__trigger ${open ? "is-open" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        {value ? (
          <span className="filter-field__chip">
            {value}
            <X
              size={13}
              onClick={(event) => {
                event.stopPropagation();
                onChange("");
              }}
            />
          </span>
        ) : (
          <span className="filter-field__placeholder">{placeholder}</span>
        )}
        <ChevronDown className="filter-field__chevron" size={18} />
      </button>
      {open && (
        <div className="filter-field__menu">
          <label className="filter-field__search">
            <input
              autoFocus
              value={query}
              placeholder={placeholder}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Search size={16} />
          </label>
          <div className="filter-field__options">
            {filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
