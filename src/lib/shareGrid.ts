import type { ScoreRes } from "../types";

export function emoji(closeness: number): string {
  if (closeness >= 0.85) return "🟩";
  if (closeness >= 0.6) return "🟨";
  if (closeness >= 0.3) return "🟧";
  return "🟥";
}

export function shareText(
  num: number,
  s: ScoreRes,
  streak?: number,
  practice = false,
): string {
  const lines = [
    `GRAPHLE #${num}${practice ? " (practice)" : ""} — ${s.total}/100`,
    s.slices.map(emoji).join(""),
  ];
  if (streak && streak > 0) lines.push(`🔥 Streak: ${streak}`);
  return lines.join("\n");
}
