import { incidents } from "@/data/incidents";

export const getKpis = () => ({
  total: incidents.length,
  open: incidents.filter((i) => i.status === "open").length,
  closed: incidents.filter((i) => i.status === "closed").length,
  high: incidents.filter((i) => i.priority === "high" && i.status !== "closed").length,
  overdue: incidents.filter((i) => i.dueDate && new Date(i.dueDate) < new Date("2026-06-12"))
    .length,
});
