import type { GraphFn, ScoreRes, Viewport } from "../types";
import { sampledToGraphFn } from "./sampledGraph";

const KEY = "graphle-save-v1";
const DAY_MS = 86_400_000;

export interface PlayRecord {
  dateKey: string;
  number: number;
  total: number;
  score?: ScoreRes;
  ys?: (number | null)[];
  demo?: boolean;
}

export interface Save {
  v: 1;
  daily: Record<string, PlayRecord>;
  practice: Record<string, PlayRecord>;
  started: Record<string, true>;
  seeded?: boolean;
}

const toUtc = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const shiftDay = (k: string, n: number) =>
  fromUtc(toUtc(k) + n * DAY_MS);

export function currentStreak(played: string[], today: string): number {
  const set = new Set(played);
  let day = set.has(today) ? today : shiftDay(today, -1);
  let n = 0;
  while (set.has(day)) {
    n++;
    day = shiftDay(day, -1);
  }
  return n;
}

export function bestStreak(played: string[]): number {
  const days = [...new Set(played)].sort();
  let best = 0;
  let run = 0;
  let prev = "";
  for (const d of days) {
    run = prev && shiftDay(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

const SAVE_SAMPLES = 201;

export function sampleFn(fn: GraphFn, vp: Viewport): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < SAVE_SAMPLES; ++i) {
    const x = vp.xMin + (i / (SAVE_SAMPLES - 1)) * (vp.xMax - vp.xMin);
    const y = fn(x);
    out.push(y === null ? null : Math.round(y * 1000) / 1000);
  }
  return out;
}

export function fnFromSamples(ys: (number | null)[], vp: Viewport): GraphFn {
  return sampledToGraphFn(
    ys.map((v) => v ?? NaN),
    vp.xMin,
    vp.xMax,
  );
}

const empty = (): Save => ({ v: 1, daily: {}, practice: {}, started: {} });

export function writeSave(save: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {}
}

export function loadSave(_today: string): Save {
  let save = empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.v === 1) {
        save = { ...empty(), ...parsed };
      }
    }
  } catch {}

  return save;
}

export function recordPlay(
  save: Save,
  mode: "daily" | "practice",
  rec: PlayRecord,
): Save {
  const next = { ...save };
  next[mode] = { ...save[mode], [rec.dateKey]: rec };
  return next;
}

export function markStarted(save: Save, dateKey: string): Save {
  return { ...save, started: { ...save.started, [dateKey]: true } };
}
