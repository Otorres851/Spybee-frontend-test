import { Incident } from "@/types/incident";
export const incidents: Incident[] = Array.from({ length: 34 }, (_, i) => {
  const types = [
    "Hidrosanitario",
    "Coordinación de Diseños",
    "Eléctrico",
    "Estructural",
    "Materiales",
    "Arquitectónico",
  ];
  const titles = [
    "Fuga en montante de aguas residuales",
    "Choque entre ductería HVAC y viga principal",
    "Tablero eléctrico sin aterrizaje a tierra",
    "Fisura en placa de concreto",
    "Material incompleto en bodega",
    "Acabado con desprendimiento",
  ];
  const priority = i % 5 === 0 ? "low" : i % 3 === 0 ? "medium" : "high";
  const status = i % 6 === 0 ? "closed" : i % 7 === 0 ? "paused" : "open";
  return {
    id: `inc-${i + 1}`,
    sequenceId: String(i + 1).padStart(4, "0"),
    title: titles[i % titles.length],
    description:
      "Incidencia registrada durante recorrido de obra. Requiere validación del responsable y seguimiento en campo.",
    type: {
      key: types[i % types.length].toLowerCase(),
      name: types[i % types.length],
    },
    priority: priority as any,
    status: status as any,
    coordinates: {
      lat: 4.652 + (Math.random() - 0.5) * 0.005,
      lng: -74.058 + (Math.random() - 0.5) * 0.006,
    },
    locationDescription: `Nivel ${(i % 12) + 1} - eje ${String.fromCharCode(65 + (i % 5))}${(i % 4) + 1}`,
    dueDate: i % 4 === 0 ? null : `2026-06-${String(10 + (i % 18)).padStart(2, "0")}T12:00:00.000Z`,
    closingDate:
      status === "closed"
        ? `2026-05-${String(10 + (i % 15)).padStart(2, "0")}T12:00:00.000Z`
        : null,
    owner: {
      name: ["Julian Rico", "Paula Pardo", "Nicolás Fernández", "Daniela Acosta"][i % 4],
      avatarUrl: `https://i.pravatar.cc/80?img=${i + 12}`,
    },
    assignees: [
      { name: "Mateo Soto", avatarUrl: `https://i.pravatar.cc/80?u=${i}` },
      { name: "Felipe Herrera", avatarUrl: `https://i.pravatar.cc/80?u=f${i}` },
    ],
    createdAt: `2026-05-${String(4 + (i % 27)).padStart(2, "0")}T10:00:00.000Z`,
    updatedAt: `2026-06-${String(1 + (i % 10)).padStart(2, "0")}T10:00:00.000Z`,
    tags: i % 3 ? [{ name: "Reproceso", color: "#EF4444" }] : [],
  };
});
