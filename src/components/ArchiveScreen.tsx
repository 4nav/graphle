import type { DayPuzzle } from "../lib/puzzleLoader";
import type { Save } from "../lib/storage";

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
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#ffffff",
        color: "#222222",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div style={{ width: 460, maxWidth: "100%" }}>
        <button onClick={onBack}>Back</button>
        <h2 style={{ margin: "16px 0 4px" }}>Past puzzles</h2>
        <p style={{ margin: "0 0 16px", color: "#666", fontSize: 14 }}>
          Practice rounds are unlimited, and they don't count toward your
          streak.
        </p>
        {days.length === 0 && <p>Nothing here yet. Check back tomorrow.</p>}

        {days.map((d) => {
          const daily = save.daily[d.dateKey];
          const prac = save.practice[d.dateKey];
          const label = daily
            ? `Daily ${daily.total}`
            : prac
              ? `Best ${prac.total}`
              : "Not played";
          return (
            <div
              key={d.dateKey}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderTop: "1px solid #ececec",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  #{d.number}· {d.puzzle.difficulty}
                </div>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {fmt(d.dateKey)}
                </div>
              </div>
              <div
                style={{ fontSize: 14, color: daily || prac ? "#222" : "#999" }}
              >
                {label}
              </div>
              <button onClick={() => onPlay(d)}>
                {prac ? "Try again" : "Play"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
