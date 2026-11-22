import { useMemo, useState } from "react";
import GraphBoard from "./graphBoard";
import { shareText } from "../lib/shareGrid";
import type { GraphFn, Puzzle, ScoreRes } from "../types";

interface Props {
  dayNumber: number;
  puzzle: Puzzle;
  target: GraphFn;
  player: GraphFn;
  score: ScoreRes;
  streak?: number;
  onReplay: () => void;
}

function Bar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
        }}
      >
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div style={{ height: 8, background: "#e6e6e6", borderRadius: 4 }}>
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: "#fa7e19",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

const swatch = (color: string) => (
  <span
    style={{
      display: "inline-block",
      width: 14,
      height: 4,
      background: color,
      marginRight: 6,
      verticalAlign: "middle",
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
  const text = shareText(dayNumber, score, streak);

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
      style={{
        display: "flex",
        height: "100vh",
        background: "#ffffff",
        color: "#222222",
      }}
    >
      <div
        style={{
          width: 340,
          padding: 24,
          overflowY: "auto",
          borderRight: "1px solid #dcdcdc",
        }}
      >
        <div style={{ fontSize: 14, color: "#666" }}>GRAPHLE #{dayNumber}</div>
        {score.total}
        <span style={{ fontSize: 24, color: "#888" }}>/100</span>

        <div style={{ margin: "20px 0" }}>
          <Bar label="Shape" value={score.shape} />
          <Bar label="Turning Points" value={score.turning} />
          <Bar label="Intercepts" value={score.intercepts} />
        </div>

        <div style={{ fontSize: 14, marginBottom: 16 }}>
          <div>{swatch("#fa7e19")}Target</div>
          <div>{swatch("#2d70b3")}Yours</div>
          <div>{swatch("#c74440")}Where you missed</div>
        </div>

        <div style={{ fontSize: 14, marginBottom: 20 }}>
          <div style={{ color: "#666" }}>The answer was</div>
          <code>{puzzle.targets.join(" + ")}</code>
        </div>
        <pre
          style={{
            background: "#f1f1f1",
            padding: 12,
            borderRadius: 4,
            fontSize: 18,
            margin: "0 0 10px",
          }}
        >
          {text}
        </pre>

        <button className="primary" onClick={copy}>
          {copied ? "Copied!" : "Copy Result"}
        </button>
        {onReplay && (
          <div style={{ marginTop: 24 }}>
            <button onClick={onReplay}>Play Again (dev only)</button>
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
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
