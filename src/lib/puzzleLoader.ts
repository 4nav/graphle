import raw from "../data/puzzles.json";
import type { Difficulty, Puzzle } from "../types";

export const LAUNCH = "2026-11-16";

const ALL = raw as unknown as Puzzle[];
const TUTORIAL = ALL.find((p) => p.isTutorial) ?? null;

const POOL: Record<Difficulty, Puzzle[]> = { easy: [], medium: [], hard: [] };
for (const p of ALL) {
  if (!p.isTutorial) {
    POOL[p.difficulty].push(p);
  }
}

const WEEKDAY: Difficulty[] = [
  "hard",
  "easy",
  "easy",
  "medium",
  "medium",
  "hard",
  "hard",
];

const DAY_MS = 86_400_000;
const toUtc = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const difficultyFor = (ms: number) => WEEKDAY[new Date(ms).getUTCDay()];

export interface DayPuzzle {
  dateKey: string;
  number: number;
  puzzle: Puzzle;
}

export function todayKey(): string {
  const o = new URLSearchParams(window.location.search).get("date");
  if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) return o;
  const n = new Date();

  const p = (v: number) => String(v).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

export function puzzleForDate(dateKey: string): DayPuzzle {
  const start = toUtc(LAUNCH);
  const ms = Math.max(toUtc(dateKey), start);
  const diff = difficultyFor(ms);

  let seen = 0;
  for (let t = start; t < ms; t += DAY_MS) {
    if (difficultyFor(t) === diff) {
      seen++;
    }
  }

  const pool = POOL[diff];
  return {
    dateKey: fromUtc(ms),
    number: Math.round((ms - start) / DAY_MS) + 1,
    puzzle: pool[seen % pool.length],
  };
}

export function archive(today: string): DayPuzzle[] {
  const out: DayPuzzle[] = [];
  for (let t = toUtc(LAUNCH); t <= toUtc(today); t += DAY_MS) {
    out.push(puzzleForDate(fromUtc(t)));
  }
  return out;
}

export const tutorialPuzzle = () => TUTORIAL;
