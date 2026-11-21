import {describe, expect, it} from "vitest";
import { Score } from "./GraphScoring";
import type { GraphFn, Viewport } from "../types";

const VP: Viewport = {xMin: -10, xMax: 10, yMin: -10, yMax: 10};
const para: GraphFn = (x) => (x * x) / 10;

describe("ScoreGraphs", () => {
  it("identical graphs score 100", () => {
    const s = Score(para, para, VP);
    expect(s.total).toBe(100);
    expect(s.slices.every((c) => c > 0.99)).toBe(true);
  });

  it("a tiny offset still scores high", () => {
    const s = Score(para, (x) => para(x) + 0.4, VP);
    expect(s.total).toBeGreaterThan(85);
    expect(s.total).toBeLessThan(100);
  });

  it("a sideways shift scores middling", () => {
    const shifted = Score(para, (x) => para(x - 2), VP);
    const close = Score(para, (x) => para(x) + 0.4, VP);
    expect(shifted.total).toBeLessThan(close.total);
    expect(shifted.total).toBeGreaterThan(25);
    expect(shifted.total).toBeLessThan(70);
  });

  it("an upside-down graph scores low", () => {
    const s = Score((x) => para(x) - 5, (x) => 5 - para(x), VP);
    expect(s.total).toBeLessThan(30);
  });

  it("a flat line against a sine wave scores very low", () => {
    const s = Score((x) => 5 * Math.sin(x), () => 8, VP);
    expect(s.total).toBeLessThan(20);
  });

  it("an empty answer scores about zero", () => {
    expect(Score(para, () => null, VP).total).toBeLessThan(5);
  });

  it("matching asymptotes are not punished", () => {
    const hyper: GraphFn = (x) => (x === 0 ? null : 1 / x);
    expect(Score(hyper, hyper, VP).total).toBe(100);
  });

  it("matching undefined regions are not punished", () => {
    const root: GraphFn = (x) => (x < 0 ? null : Math.sqrt(x));
    expect(Score(root, root, VP).total).toBe(100);
  });

  it("slices show where the miss is", () => {
    const s = Score(para, (x) => (x < 0 ? para(x) : para(x) + 8), VP);
    expect(Math.min(...s.slices.slice(0, 4))).toBeGreaterThan(0.9);
    expect(Math.max(...s.slices.slice(4))).toBeLessThan(0.1);
    expect(s.worstX.every((x) => x > 0)).toBe(true);
  });
  it("two cubics that only agree off-screen get no free credit", () => {
    const a: GraphFn = (x) => (x + 1) * (x + 2) * (x + 3);
    const b: GraphFn = (x) => x * x * x - 3 * x;
    expect(Score(a, b, VP).total).toBeLessThan(40);
  });
});