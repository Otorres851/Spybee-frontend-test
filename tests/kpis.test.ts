import { getKpis } from "@/utils/kpis";
test("calculates incident KPIs", () => {
  const k = getKpis();
  expect(k.total).toBeGreaterThan(0);
  expect(k.open).toBeGreaterThan(0);
});
