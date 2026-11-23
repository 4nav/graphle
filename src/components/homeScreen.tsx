import type { DayPuzzle } from "../lib/puzzleLoader";
import { bestStreak, currentStreak, type Save } from "../lib/storage";
import Squiggle from "./Squiggle";

interface Props {
  today: DayPuzzle;
  save: Save;
  hasArchive: boolean;
  onPlayToday: () => void;
  onArchive: () => void;
}

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
  const streak = currentStreak(played, today.dateKey);
  const best = bestStreak(played);

  return (
    <div
      className="sketch"
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        padding: "56px, 24px",
        background: "#ffffff",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ fontSize: 80, lineHeight: 1, margin: 0, fontWeight: 400 }}>
          GRAPHLE
        </h1>
        <Squiggle width={280} />
        <p style={{ fontSize: 24, margin: "12px 0 40px" }}>
          Look at a graph for a few seconds, then redraw it from memory!
        </p>

        <div style={{ fontSize: 20, color: "#666" }}>
          today · #{today.number} · {today.puzzle.difficulty}
        </div>
        {done ? (
          <div style={{ fontSize: 72, lineHeight: 1.1, margin: "4px 0 12px" }}>
            {rec!.total}
            <span style={{ fontSize: 28, color: "#888" }}>/100</span>
          </div>
        ) : (
          <p style={{ fontSize: 22, margin: "6px 0 16px" }}>
            {started
              ? "You've already seen today's graph, no cheating!"
              : `You get ${today.puzzle.studyTime} seconds to study it.`}
          </p>
        )}
        <button
          className="primary"
          style={{ fontSize: 26, padding: "8px 28px" }}
          onClick={onPlayToday}
        >
          {done
            ? "see today's result"
            : started
              ? "Resume"
              : "play todays puzzle"}
        </button>

        <p style={{ fontSize: 22, margin: "28px 0 0" }}>
          streak: {streak} <span style={{ color: "#999" }}>·</span> best: {best}
        </p>
        <div style={{ marginTop: 36 }}>
          <button onClick={onArchive} disabled={!hasArchive}>
            {hasArchive ? "past puzzles" : "past puzzles(come back tomorrow)"}
          </button>
        </div>

        <div style={{ marginTop: 44, fontSize: 21, lineHeight: 1.5 }}>
          <div>how it works</div>
          <ol style={{ margin: "6px 0 0", paddingLeft: 24 }}>
            <li>Study the graph before the timer runs out.</li>
            <li>
              Once it vanishes, rebuild what you remember with equations,
              templates or draggable points.
            </li>
            <li>Submit, see how close you got, share the results</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
