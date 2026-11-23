import { useMemo, useState } from "react";
import GraphBoard from "./graphBoard";
import Squiggle from "./Squiggle";
import { shareText } from "../lib/shareGrid";
import type { GraphFn, Puzzle, ScoreRes } from "../types";

interface Props {
  dayNumber: number;
  puzzle: Puzzle;
  target: GraphFn;
  player: GraphFn;
  score: ScoreRes;
  streak?: number;
  practice?: boolean;
  homeLabel?: string;
  onHome?: () => void;
  onRetry?: () => void;
  onReplay?: () => void;
}

function Bar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null; // the target has none of these, so nothing was graded
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
        }}
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="sketch-track">
        <div className="sketch-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

const swatch = (color: string) => (
  <span
    style={{
      display: "inline-block",
      width: 22,
      height: 5,
      background: color,
      marginRight: 8,
      verticalAlign: "middle",
      borderRadius: 3,
    }}
  />
);

export default function EndScreen({
  dayNumber,
  puzzle,
  target,
  player,
  score,
  streak,
  practice,
  homeLabel,
  onHome,
  onRetry,
  onReplay,
}: Props) {
  const [copied, setCopied] = useState(false);

  const curves = useMemo(
    () => [
      { id: "target", fn: target, color: "#fa7e19" },
      { id: "player", fn: player, color: "#2d70b3" },
    ],
    [target, player],
  );
  const gap = useMemo(() => ({ a: target, b: player }), [target, player]);
  const text = shareText(
    dayNumber,
    score,
    practice ? undefined : streak,
    practice,
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="sketch"
      style={{
        display: "flex",
        height: "100vh",
        boxSizing: "border-box",
        padding: 20,
        gap: 24,
        background: "#ffffff",
      }}
    >
      <div style={{ width: 330, overflowY: "auto" }}>
        <div style={{ fontSize: 22, color: "#666" }}>
          GRAPHLE #{dayNumber}
          {practice ? " (practice)" : ""}
        </div>
        <div style={{ fontSize: 100, lineHeight: 1 }}>
          {score.total}
          <span style={{ fontSize: 30, color: "#888" }}>/100</span>
        </div>
        <Squiggle width={200} />

        <div style={{ margin: "22px 0" }}>
          <Bar label="shape" value={score.shape} />
          <Bar label="turning points" value={score.turning} />
          <Bar label="intercepts" value={score.intercepts} />
        </div>

        <div style={{ fontSize: 20, marginBottom: 18, lineHeight: 1.5 }}>
          <div>{swatch("#fa7e19")}target</div>
          <div>{swatch("#2d70b3")}yours</div>
          <div>{swatch("#c74440")}where you missed</div>
        </div>

        <div style={{ fontSize: 20, marginBottom: 20 }}>
          <div style={{ color: "#666" }}>the answer was</div>
          <code style={{ fontSize: 17 }}>{puzzle.targets.join("  +  ")}</code>
        </div>

        <pre
          style={{
            fontFamily: "inherit",
            fontSize: 24,
            lineHeight: 1.3,
            margin: "0 0 12px",
            padding: "10px 14px",
            border: "2px dashed #2b2b2b",
            borderRadius: 6,
          }}
        >
          {text}
        </pre>
        <button className="primary" onClick={copy}>
          {copied ? "copied!" : "copy result"}
        </button>

        <div
          style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          {onHome && <button onClick={onHome}>{homeLabel ?? "menu"}</button>}
          {onRetry && <button onClick={onRetry}>try again</button>}
          {onReplay && <button onClick={onReplay}>replay (dev)</button>}
        </div>
      </div>

      <div className="sketch-frame" style={{ flex: 1, minWidth: 0 }}>
        <GraphBoard
          viewport={puzzle.viewport}
          curves={curves}
          hideGrid={puzzle.hideGrid}
          gap={gap}
          markers={score.worstX}
        />
      </div>
    </div>
  );
}
