"use client";

import { DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, FileUp, Search, UploadCloud, X } from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { useT } from "@/hooks/useT";
import { Button } from "@/components/ui/AppButton";
import { IncidentsMapCanvas } from "@/components/map/IncidentsMapCanvas";
import type { Incident, Priority } from "@/types/incident";

const categories = [
  "Eléctrico",
  "Estabilidad",
  "Coordinación de Diseños Duvan",
  "Prevención de riesgos",
  "Observación General",
  "Infraestructura",
  "Estructural",
  "Estudio Suelos",
  "Hidrosanitario",
  "Materiales",
];

const tags = [
  "Edificio 2",
  "Piso 1",
  "Piso 2",
  "Apartamento 112",
  "Prueba",
  "Prueba2",
  "test 1",
  "nivel 1",
];
const users = [
  "Alejandro Test · PRUEBA EMPRESA [test role]",
  "Julian Lozano · SPYBEE [Web Dev]",
  "Julian Rico · SPYBEE [—]",
  "Demo Late · SPYBEE [—]",
  "Juan Sebastian Perez · SPYBEE [—]",
  "Diego Andrés González Samboni · SPYBEE [Ingeniero Operaciones]",
];

/**
 * Incident creation flow. It supports map picking, multi-selects and file uploads.
 */
export function CreateIncidentModal() {
  const { modal, setModal, draftLocation, addIncident, createdIncidents } = useUiStore();
  const t = useT();
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState(t.high);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [observers, setObservers] = useState<string[]>([]);
  const [locationDetails, setLocationDetails] = useState("");
  const [location, setLocation] = useState(draftLocation ?? { lat: 4.65242, lng: -74.05846 });
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const priorityOptions = [t.high, t.medium, t.low];
  const requiredErrors = {
    title: submitted && title.trim().length === 0,
    description: submitted && description.trim().length === 0,
    category: submitted && category.trim().length === 0,
    priority: submitted && priority.trim().length === 0,
    location: submitted && (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)),
  };
  const hasErrors = Object.values(requiredErrors).some(Boolean);

  useEffect(() => {
    if (modal && draftLocation) setLocation(draftLocation);
  }, [draftLocation, modal]);

  const priorityValue = useMemo<Priority>(() => {
    if (priority === t.low) return "low";
    if (priority === t.medium) return "medium";
    return "high";
  }, [priority, t.low, t.medium]);

  const handlePickLocation = useCallback((nextLocation: { lat: number; lng: number }) => {
    setLocation(nextLocation);
  }, []);

  if (!modal) return null;

  const close = () => {
    setSubmitted(false);
    setModal(false, null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const incoming = Array.from(event.dataTransfer.files).filter((file) =>
      /image|video|pdf|word|excel|spreadsheet|document/.test(file.type)
    );
    setFiles((current) => [...current, ...incoming].slice(0, 5));
  };

  const handleCreate = () => {
    setSubmitted(true);
    if (!title.trim() || !description.trim() || !category.trim() || !priority.trim() || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return;
    const maxCreatedSequence = createdIncidents.reduce((max, incident) => {
      const sequence = Number(incident.sequenceId);
      return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
    }, 200);
    const sequence = String(maxCreatedSequence + 1).padStart(4, "0");
    const incident: Incident = {
      id: `local-${Date.now()}`,
      sequenceId: sequence,
      order: Number(sequence),
      title: title.trim(),
      description: description.trim(),
      type: { key: category.toLowerCase().replaceAll(" ", "-"), name: category },
      priority: priorityValue,
      status: "open",
      coordinates: location,
      locationDescription:
        locationDetails || `Lat ${location.lat.toFixed(5)}, Lng ${location.lng.toFixed(5)}`,
      dueDate: dueDate ? `${dueDate}T12:00:00.000Z` : null,
      closingDate: null,
      owner: {
        name: "Julian",
        email: "julian@spybee.com",
        avatarUrl: "https://i.pravatar.cc/80?u=julian",
      },
      assignees: assignees.map((name, index) => ({
        name: name.split(" · ")[0],
        avatarUrl: `https://i.pravatar.cc/80?u=${encodeURIComponent(name)}-${index}`,
      })),
      observers: observers.map((name, index) => ({
        name: name.split(" · ")[0],
        avatarUrl: `https://i.pravatar.cc/80?u=${encodeURIComponent(name)}-observer-${index}`,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      media: files.map((file, index) => ({
        id: `local-media-${Date.now()}-${index}`,
        name: file.name,
        type: file.type.startsWith("video") ? "video" : "image",
        size: file.size,
        status: "uploaded",
        url: URL.createObjectURL(file),
      })),
      tags: selectedTags.map((name) => ({ name, color: "#FFC400" })),
    };
    addIncident(incident);
    close();
  };

  return (
    <div
      className={[
        "fixed inset-0 z-[80] grid place-items-center overflow-y-auto",
        "bg-black/55 p-2 backdrop-blur-sm md:p-4",
      ].join(" ")}
    >
      <form
        className={[
          "incident-modal my-4 w-full max-w-[980px] rounded-[1.45rem]",
          "bg-[var(--panel)] p-3 shadow-2xl sm:p-4 md:my-5",
          "md:rounded-[1.75rem] md:p-6",
        ].join(" ")}
      >
        <div className="incident-modal__header">
          <h2>{t.create}</h2>
          <button type="button" onClick={close} aria-label={t.closeModal}>
            <X />
          </button>
        </div>

        <div className="incident-modal__body">
          <section className="incident-modal__section">
            <label className={`incident-field incident-field--full ${requiredErrors.title ? "is-invalid" : ""}`}>
              <span className="required">
                * <b>{t.title}</b>
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t.title}
                aria-invalid={requiredErrors.title}
              />
              {requiredErrors.title && <small className="incident-field__error">{t.requiredField}</small>}
            </label>
            <label className={`incident-field incident-field--full ${requiredErrors.description ? "is-invalid" : ""}`}>
              <span className="required">
                * <b>{t.description}</b>
              </span>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t.description}
                aria-invalid={requiredErrors.description}
              />
              {requiredErrors.description && <small className="incident-field__error">{t.requiredField}</small>}
            </label>
          </section>

          <section className="incident-modal__section incident-modal__grid">
            <label className="incident-field">
              <span>{t.due}</span>
              <input
                type="date"
                min={today}
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>

            <div className={`incident-field incident-field--wide ${requiredErrors.category ? "is-invalid" : ""}`}>
              <span className="required">
                * <b>{t.category}</b>
              </span>
              <div className="incident-modal__inline">
                <FieldDropdown
                  placeholder={t.categoryPlaceholder}
                  value={category}
                  options={categories}
                  onChange={setCategory}
                  colored
                />
                <Button type="button" className="incident-modal__manage">
                  {t.manageCategories}
                </Button>
              </div>
              {requiredErrors.category && <small className="incident-field__error">{t.requiredField}</small>}
            </div>

            <div className={`incident-field ${requiredErrors.priority ? "is-invalid" : ""}`}>
              <span className="required">
                * <b>{t.priority}</b>
              </span>
              <FieldDropdown
                placeholder={t.priorityPlaceholder}
                value={priority}
                options={priorityOptions}
                onChange={setPriority}
              />
              {requiredErrors.priority && <small className="incident-field__error">{t.requiredField}</small>}
            </div>
          </section>

          <section className="incident-modal__section">
            <div className="incident-field incident-field--full">
              <span>{t.tags}</span>
              <div className="incident-modal__inline">
                <MultiDropdown
                  placeholder={t.tagsPlaceholder}
                  values={selectedTags}
                  options={tags}
                  onChange={setSelectedTags}
                  tree
                />
                <Button type="button" className="incident-modal__manage">
                  {t.manage}
                </Button>
              </div>
            </div>
            <div className="incident-field incident-field--full">
              <span>{t.assignees}</span>
              <MultiDropdown
                placeholder={t.assigneesPlaceholder}
                values={assignees}
                options={users}
                onChange={setAssignees}
                grouped
              />
            </div>
            <div className="incident-field incident-field--full">
              <span>{t.observers}</span>
              <MultiDropdown
                placeholder={t.observersPlaceholder}
                values={observers}
                options={users}
                onChange={setObservers}
                grouped
              />
            </div>
          </section>

          <section className="incident-modal__section">
            <h3>{t.location}</h3>
            <div className="incident-modal__coordinates">
              <label className="incident-field">
                <span>{t.latitude}</span>
                <input readOnly value={location.lat} />
              </label>
              <label className="incident-field">
                <span>{t.longitude}</span>
                <input readOnly value={location.lng} />
              </label>
            </div>
            <label className="incident-field incident-field--full">
              <span>{t.locationDetails}</span>
              <input
                value={locationDetails}
                onChange={(event) => setLocationDetails(event.target.value)}
              />
            </label>
            <div className="incident-modal__map relative">
              <IncidentsMapCanvas
                compact
                picker
                onPick={handlePickLocation}
                incidents={[
                  {
                    id: "draft-location",
                    sequenceId: "draft",
                    order: 0,
                    title: t.locationSelected,
                    description: "",
                    type: { key: "draft", name: t.location },
                    priority: priorityValue,
                    status: "open",
                    coordinates: location,
                    locationDescription: `Lat ${location.lat.toFixed(5)}, Lng ${location.lng.toFixed(5)}`,
                    dueDate: null,
                    closingDate: null,
                    owner: { name: "Spybee", email: "", avatarUrl: "" },
                    assignees: [],
                    observers: [],
                    media: [],
                    tags: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ]}
              />
              <div className="incident-location-pin" aria-hidden="true">
                <i />
              </div>
            </div>
          </section>

          <section className="incident-modal__section">
            <h3>{t.attachedFiles}</h3>
            <label
              className="incident-upload"
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
            >
              <UploadCloud size={36} />
              <strong>{t.dropFiles}</strong>
              <span>{t.browseFiles}</span>
              <small>{t.uploadHint}</small>
              <input
                hidden
                multiple
                max={5}
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))}
              />
            </label>
            {files.length > 0 && (
              <div className="incident-files--preview">
                {files.map((file) => {
                  const previewUrl = URL.createObjectURL(file);
                  return (
                    <div className="incident-file-card" key={`${file.name}-${file.size}`}>
                      <button
                        type="button"
                        aria-label={t.removeFile}
                        onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                      >
                        <X size={14} />
                      </button>
                      {file.type.startsWith("image") ? (
                        <img src={previewUrl} alt={file.name} />
                      ) : file.type.startsWith("video") ? (
                        <video src={previewUrl} muted />
                      ) : (
                        <span className="incident-file-card__fallback">
                          <FileUp size={24} />
                        </span>
                      )}
                      <small title={file.name}>{file.name}</small>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="incident-modal__footer">
          <Button type="button" variant="ghost" onClick={close}>
            {t.cancel}
          </Button>
          {submitted && hasErrors && <small className="incident-form-error">{t.requiredFieldsHint}</small>}
          <Button type="button" onClick={handleCreate}>
            {t.createIncident}
          </Button>
        </div>
      </form>
    </div>
  );
}

type FieldDropdownProps = {
  placeholder: string;
  value: string;
  options: string[];
  colored?: boolean;
  onChange: (value: string) => void;
};

function FieldDropdown({ placeholder, value, options, colored, onChange }: FieldDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="incident-select">
      <button
        type="button"
        className={`incident-select__trigger ${open ? "is-open" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value ? undefined : "incident-select__placeholder"}>
          {value || placeholder}
        </span>
        <ChevronDown className="incident-select__chevron" size={18} />
      </button>
      {open && (
        <div className="incident-select__menu">
          <label className="incident-select__search">
            <input
              autoFocus
              value={query}
              placeholder={placeholder}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Search size={16} />
          </label>
          <div className="incident-select__options">
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {colored && <i />}
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type MultiDropdownProps = {
  placeholder: string;
  values: string[];
  options: string[];
  grouped?: boolean;
  tree?: boolean;
  onChange: (values: string[]) => void;
};

function MultiDropdown({
  placeholder,
  values,
  options,
  grouped,
  tree,
  onChange,
}: MultiDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = options.filter((option) => option.toLowerCase().includes(query.toLowerCase()));

  const toggle = (option: string) => {
    onChange(
      values.includes(option)
        ? values.filter((value) => value !== option)
        : [...values, option].slice(0, 4)
    );
  };

  return (
    <div className="incident-select">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        className={`incident-select__trigger ${open ? "is-open" : ""}`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((current) => !current);
          }
        }}
      >
        <span className="incident-select__chips">
          {values.length === 0 ? (
            <span className="incident-select__placeholder">{placeholder}</span>
          ) : (
            values.map((value) => (
              <em key={value}>
                {value.split(" · ")[0]}
                <button
                  type="button"
                  aria-label={`Quitar ${value}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange(values.filter((item) => item !== value));
                  }}
                >
                  <X size={13} />
                </button>
              </em>
            ))
          )}
        </span>
        <ChevronDown className="incident-select__chevron" size={18} />
      </div>
      {open && (
        <div className="incident-select__menu incident-select__menu--large">
          <label className="incident-select__search">
            <input
              autoFocus
              value={query}
              placeholder={placeholder}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Search size={16} />
          </label>
          <div className="incident-select__options">
            {grouped && <strong className="incident-select__group">PRUEBA EMPRESA</strong>}
            {filtered.slice(0, grouped ? 1 : filtered.length).map((option) => (
              <Option
                key={option}
                option={option}
                tree={tree}
                selected={values.includes(option)}
                onClick={() => toggle(option)}
              />
            ))}
            {grouped && <strong className="incident-select__group">SPYBEE</strong>}
            {grouped &&
              filtered
                .slice(1)
                .map((option) => (
                  <Option
                    key={option}
                    option={option}
                    selected={values.includes(option)}
                    onClick={() => toggle(option)}
                  />
                ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Option({
  option,
  tree,
  selected,
  onClick,
}: {
  option: string;
  tree?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={selected ? "is-selected" : undefined} onClick={onClick}>
      {tree && (
        <span className="incident-tree" data-checked={selected}>
          {selected && <Check size={12} />}
        </span>
      )}
      {!tree && (
        <span className="incident-checkbox" data-checked={selected}>
          {selected && <Check size={12} />}
        </span>
      )}
      <i />
      <span className="incident-option-text">{option}</span>
    </button>
  );
}
