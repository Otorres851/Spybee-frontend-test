import { useUiStore } from "@/stores/useUiStore";

describe("useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState({
      lang: "es",
      dark: false,
      modal: false,
      mobileNav: false,
      draftLocation: null,
      createdIncidents: [],
    });
  });

  it("should open incident modal", () => {
    useUiStore.getState().setModal(true);

    expect(useUiStore.getState().modal).toBe(true);
  });

  it("should close incident modal", () => {
    useUiStore.getState().setModal(false);

    expect(useUiStore.getState().modal).toBe(false);
  });

  it("should save draft location when opening modal", () => {
    const location = { lat: 4.65242, lng: -74.05846 };

    useUiStore.getState().setModal(true, location);

    expect(useUiStore.getState().draftLocation).toEqual(location);
  });
});
