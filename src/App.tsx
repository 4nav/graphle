import { useMemo, useState } from "react";
import ArchiveScreen from "./components/ArchiveScreen";
import Game from "./components/Game";
import HomeScreen from "./components/homeScreen";
import {
  archive,
  puzzleForDate,
  todayKey,
  type DayPuzzle,
} from "./lib/puzzleLoader";
import { loadSave, writeSave, type Save } from "./lib/storage";
import { vi } from "vitest";

type View =
  | { kind: "home" }
  | { kind: "archive" }
  | {
      kind: "game";
      day: DayPuzzle;
      mode: "daily" | "practice";
      attempt: number;
    };

export default function App() {
  const today = useMemo(() => puzzleForDate(todayKey()), []);
  const past = useMemo(
    () =>
      archive(today.dateKey)
        .filter((d) => d.dateKey < today.dateKey)
        .reverse(),
    [today],
  );

  const [save, setSaveState] = useState<Save>(() => loadSave(today.dateKey));
  const [view, setView] = useState<View>({ kind: "home" });

  const setSave = (s: Save) => {
    setSaveState(s);
    writeSave(s);
  };

  if (view.kind === "archive") {
    return (
      <ArchiveScreen
        days={past}
        save={save}
        onPlay={(d) =>
          setView({ kind: "game", day: d, mode: "practice", attempt: 0 })
        }
        onBack={() => setView({ kind: "home" })}
      />
    );
  }

  if (view.kind === "game") {
    return (
      <Game
        key={`${view.mode}-${view.day.dateKey}-${view.attempt}`}
        day={view.day}
        mode={view.mode}
        save={save}
        onSave={setSave}
        onHome={() =>
          setView({ kind: view.mode === "practice" ? "archive" : "home" })
        }
        onRetry={() => setView({ ...view, attempt: view.attempt + 1 })}
      />
    );
  }

  return (
    <HomeScreen
      today={today}
      save={save}
      hasArchive={past.length > 0}
      onPlayToday={() =>
        setView({ kind: "game", day: today, mode: "daily", attempt: 0 })
      }
      onArchive={() => setView({ kind: "archive" })}
    ></HomeScreen>
  );
}
