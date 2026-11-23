import type { DayPuzzle } from "../lib/puzzleLoader";
import type { Save } from "../lib/storage";
import Squiggle from "./Squiggle";

interface Props {
  days: DayPuzzle[];
  save: Save;
  onPlay: (d: DayPuzzle) => void;
  onBack: () => void;
}

const fmt = (key: string) =>
  new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function ArchiveScreen({ days, save, onPlay, onBack }: Props) {
  return (
    <div
      className="sketch"
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "40px 24px",
        background: "#ffffff",
      }}
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <button onClick={onBack}>back</button>
        <h2
          style={{
            fontSize: 52,
            margin: "24px 0 0",
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          {" "}
          Past Graphles
        </h2>
        <Squiggle width={220} />
        <p style={{ fontSize: 20, color: "#666", margin: "10px 0 20px" }}>
          You have unlimited attempts during practice.
        </p>

        {days.length === 0 && (
          <p style={{ fontSize: 22 }}>Nothing here yet. Check back tmrw.</p>
        )}

        {days.map((d) => {
          const daily = save.daily[d.dateKey];
          const prac = save.practice[d.dateKey];
          const label = daily
            ? `daily ${daily.total}`
            : prac
              ? `best ${prac.total}`
              : "not played";
          return (
            <div
              key={d.dateKey}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 0",
                borderBottom: "2px dashed #bbb",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 26, lineHeight: 1.1 }}>
                  #{d.number} · {d.puzzle.difficulty}
                </div>
                <div style={{ fontSize: 18, color: "#666" }}>
                  {fmt(d.dateKey)}
                </div>
              </div>
              <div
                style={{
                  fontSize: 22,
                  color: daily || prac ? "#2b2b2b" : "#999",
                }}
              >
                {label}
              </div>
              <button onClick={() => onPlay(d)}>
                {prac ? "try again" : "play"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
