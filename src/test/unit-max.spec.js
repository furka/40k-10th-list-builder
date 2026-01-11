import { describe, it, expect, vi, beforeEach } from "vitest";
import { unitMax } from "../utils/unit-max";

vi.mock("../utils/is-battleline", () => ({ isBattleLine: vi.fn() }));
vi.mock("../utils/is-dedicated-transport", () => ({ isDedicatedTransport: vi.fn() }));
vi.mock("../utils/boarding-actions", () => ({ getBoardingActionsMax: vi.fn() }));

import { isBattleLine } from "../utils/is-battleline";
import { isDedicatedTransport } from "../utils/is-dedicated-transport";

describe("unitMax", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isBattleLine.mockReturnValue(false);
    isDedicatedTransport.mockReturnValue(false);
  });

  it("returns 1 for epic hero units", () => {
    expect(unitMax({ epicHero: true }, false)).toBe(1);
  });

  it("returns 6 for battleline units", () => {
    isBattleLine.mockReturnValue(true);
    expect(unitMax({ battleLine: true }, false)).toBe(6);
  });

  it("returns 6 for dedicated transport units", () => {
    isDedicatedTransport.mockReturnValue(true);
    expect(unitMax({ dedicatedTransport: true }, false)).toBe(6);
  });

  it("returns 3 for regular units", () => {
    expect(unitMax({ name: "Hellblaster Squad" }, false)).toBe(3);
  });

  it("returns 3 for non-epic character units", () => {
    expect(unitMax({ character: true }, false)).toBe(3);
  });
});
