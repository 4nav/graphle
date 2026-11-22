import type { DayPuzzle } from "../lib/puzzleLoader";
import { bestStreak, currentStreak, type Save } from "../lib/storage";

interface Props {
  today: DayPuzzle;
  save: Save;
  hasArchive: boolean;
  onPlayToday: () => void;
  onArchive: () => void;
}

const stat = (label: string, value: number | string) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
  </div>
);

export default function HomeScreen({
  today,
  save,
  hasArchive,
  onPlayToday,
  onArchive,
}: Props) {
  const rec = save.daily[today.dateKey];
  const done = !!(rec && rec.score);
  const started = !!save.started[today.dateKey];
  const played = Object.keys(save.daily);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 24,
        background: "#ffffff",
        color: "#222222",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 44 }}>GRAPHLE</h1>
      <p style={{ margin: 0, color: "#666", textAlign: "center" }}>
        Memorise a graph for a few seconds, then rebuild it from memory!
      </p>
      <div
        style={{
          width: 340,
          maxWidth: "100%",
          border: "1px solid #dcdcdc",
          borderRadius: 8,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 14, color: "#666" }}>
          Today: #{today.number}· {today.puzzle.difficulty}
        </div>
        {done ? (
          <div style={{ fontSize: 32, fontWeight: 700 }}>
            {rec!.total}
            <span style={{ fontSize: 16, color: "#888" }}>/100</span>
          </div>
        ) : (
          <div style={{ fontSize: 14 }}>
            {started
              ? "You've already seen today's graph, so you'll jump straight to rebuilding it."
              : `You get ${today.puzzle.studyTime} seconds to study it.`}
          </div>
        )}
        <button className="primary" onClick={onPlayToday}>
          {done
            ? "See today's score"
            : started
              ? "Resume today's puzzle"
              : "Play today's graphle"}
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: 4,
          }}
        >
          {stat("Streak", currentStreak(played, today.dateKey))}
          {stat("Best streak", bestStreak(played))}
        </div>
      </div>
      <button onClick={onArchive} disabled={!hasArchive}>
        {hasArchive ? "Past puzzles" : "Past puzzles (come back tommorow)"}
      </button>

      <ol
        style={{
          margin: 0,
          paddingLeft: 20,
          maxWidth: 340,
          color: "#555",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <li>Study the graph quickly before it disappears</li>
        <li>
          It disappears. Rebuild it with equations, templates, or draggable
          points.
        </li>
        <li>Submit to see how close you got, then share your result.</li>
      </ol>
    </div>
  );
}
