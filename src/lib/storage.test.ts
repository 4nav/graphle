import { describe, expect, it } from "vitest";
import { bestStreak, currentStreak, shiftDay } from "./storage";

describe("streaks", () => {
  it("shifts days across months and year shd end", () => {
    expect(shiftDay("2026-11-30", 1)).toBe("2026-12-01");
    expect(shiftDay("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-11-19", "2026-11-20"], "2026-11-21")).toBe(2);
  });

  it("streak stops", () => {
    expect(currentStreak(["2026-11-18", "2026-11-19"], "2026-11-21")).toBe(0);
  });

  it("finds best streak", () => {
    expect(
      bestStreak([
        "2026-11-01",
        "2026-11-02",
        "2026-11-04",
        "2026-11-05",
        "2026-11-06",
      ]),
    ).toBe(3);
    expect(bestStreak([])).toBe(0);
  });
});
