import { countOpenIncidents } from "@/utils/incidents";

describe("countOpenIncidents", () => {
  it("should count open incidents correctly", () => {
    const incidents = [{ status: "open" }, { status: "closed" }, { status: "open" }];

    expect(countOpenIncidents(incidents)).toBe(2);
  });
});
