import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import DataSheet from "../components/DataSheet.vue";

vi.mock("uuid", () => ({ v4: vi.fn(() => "mock-uuid") }));
vi.mock("../utils/is-battleline", () => ({ isBattleLine: vi.fn() }));
vi.mock("../utils/is-dedicated-transport", () => ({ isDedicatedTransport: vi.fn() }));
vi.mock("../utils/boarding-actions", () => ({
  isBoardingActionsSlotFull: vi.fn(() => false),
  getBoardingActionsMax: vi.fn(() => 999),
  getBoardingActionsErrorMessage: vi.fn(() => null),
  isBoardingActionsDetachment: vi.fn(() => false),
}));
vi.mock("../utils/endless-enhancement", () => ({ isEndlessEnhancement: vi.fn(() => false) }));

import { isBattleLine } from "../utils/is-battleline";
import { isDedicatedTransport } from "../utils/is-dedicated-transport";
import { useArmyListStore } from "../stores/armyList";

const createUnits = (name, count) =>
  Array.from({ length: count }, (_, i) => ({ id: `unit-${i}`, name, models: 5 }));

const mountDataSheet = (name, props, units = []) =>
  mount(DataSheet, {
    props: { dataSheet: { name, sizes: [{ name: null, models: 5, points: 100 }], ...props } },
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
          initialState: {
            armyList: { units, detachment: "", mfm_version: "" },
            collection: { collection: { [name]: 999 } },
            app: { editCollection: false, showPointsChanges: false, group: "role" },
          },
        }),
      ],
    },
  });

describe("DataSheet - Unit Limits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isBattleLine.mockReturnValue(false);
    isDedicatedTransport.mockReturnValue(false);
  });

  describe("epic hero (max 1)", () => {
    const name = "Roboute Guilliman";
    const props = { epicHero: true };

    it("displays 0/1 with none added", () => {
      expect(mountDataSheet(name, props).text()).toContain("0/1");
    });

    it("displays 1/1 when one added", () => {
      expect(mountDataSheet(name, props, createUnits(name, 1)).text()).toContain("1/1");
    });

    it("has maxed class at count 1", () => {
      expect(mountDataSheet(name, props, createUnits(name, 1)).find(".data-sheet__title").classes()).toContain("maxed");
    });

    it("does not have maxed class at count 0", () => {
      expect(mountDataSheet(name, props).find(".data-sheet__title").classes()).not.toContain("maxed");
    });

    it("blocks addUnit at max", async () => {
      const wrapper = mountDataSheet(name, props, createUnits(name, 1));
      await wrapper.find("li").trigger("click");
      expect(useArmyListStore().addUnit).not.toHaveBeenCalled();
    });

    it("allows addUnit below max", async () => {
      const wrapper = mountDataSheet(name, props);
      await wrapper.find("li").trigger("click");
      expect(useArmyListStore().addUnit).toHaveBeenCalled();
    });
  });

  describe("battleline (max 6)", () => {
    const name = "Intercessor Squad";
    const props = { battleLine: true };

    beforeEach(() => isBattleLine.mockReturnValue(true));

    it("displays 0/6 with none added", () => {
      expect(mountDataSheet(name, props).text()).toContain("0/6");
    });

    it("displays 6/6 at max", () => {
      expect(mountDataSheet(name, props, createUnits(name, 6)).text()).toContain("6/6");
    });

    it("has maxed class at count 6", () => {
      expect(mountDataSheet(name, props, createUnits(name, 6)).find(".data-sheet__title").classes()).toContain("maxed");
    });

    it("does not have maxed class at count 5", () => {
      expect(mountDataSheet(name, props, createUnits(name, 5)).find(".data-sheet__title").classes()).not.toContain("maxed");
    });

    it("blocks addUnit at max", async () => {
      const wrapper = mountDataSheet(name, props, createUnits(name, 6));
      await wrapper.find("li").trigger("click");
      expect(useArmyListStore().addUnit).not.toHaveBeenCalled();
    });

    it("allows addUnit below max", async () => {
      const wrapper = mountDataSheet(name, props, createUnits(name, 5));
      await wrapper.find("li").trigger("click");
      expect(useArmyListStore().addUnit).toHaveBeenCalled();
    });
  });

  describe("dedicated transport (max 6)", () => {
    const name = "Rhino";
    const props = { dedicatedTransport: true };

    beforeEach(() => isDedicatedTransport.mockReturnValue(true));

    it("displays 0/6 with none added", () => {
      expect(mountDataSheet(name, props).text()).toContain("0/6");
    });

    it("displays 6/6 at max", () => {
      expect(mountDataSheet(name, props, createUnits(name, 6)).text()).toContain("6/6");
    });

    it("has maxed class at count 6", () => {
      expect(mountDataSheet(name, props, createUnits(name, 6)).find(".data-sheet__title").classes()).toContain("maxed");
    });

    it("does not have maxed class at count 5", () => {
      expect(mountDataSheet(name, props, createUnits(name, 5)).find(".data-sheet__title").classes()).not.toContain("maxed");
    });

    it("blocks addUnit at max", async () => {
      const wrapper = mountDataSheet(name, props, createUnits(name, 6));
      await wrapper.find("li").trigger("click");
      expect(useArmyListStore().addUnit).not.toHaveBeenCalled();
    });

    it("allows addUnit below max", async () => {
      const wrapper = mountDataSheet(name, props, createUnits(name, 5));
      await wrapper.find("li").trigger("click");
      expect(useArmyListStore().addUnit).toHaveBeenCalled();
    });
  });

  describe("regular unit (max 3)", () => {
    const name = "Hellblaster Squad";
    const props = {};

    it("displays 0/3 with none added", () => {
      expect(mountDataSheet(name, props).text()).toContain("0/3");
    });

    it("displays 3/3 at max", () => {
      expect(mountDataSheet(name, props, createUnits(name, 3)).text()).toContain("3/3");
    });

    it("has maxed class at count 3", () => {
      expect(mountDataSheet(name, props, createUnits(name, 3)).find(".data-sheet__title").classes()).toContain("maxed");
    });

    it("does not have maxed class at count 2", () => {
      expect(mountDataSheet(name, props, createUnits(name, 2)).find(".data-sheet__title").classes()).not.toContain("maxed");
    });

    it("blocks addUnit at max", async () => {
      const wrapper = mountDataSheet(name, props, createUnits(name, 3));
      await wrapper.find("li").trigger("click");
      expect(useArmyListStore().addUnit).not.toHaveBeenCalled();
    });

    it("allows addUnit below max", async () => {
      const wrapper = mountDataSheet(name, props, createUnits(name, 2));
      await wrapper.find("li").trigger("click");
      expect(useArmyListStore().addUnit).toHaveBeenCalled();
    });
  });
});
