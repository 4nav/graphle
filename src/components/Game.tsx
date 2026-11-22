import { useMemo, useRef, useState } from "react";
import DesmosEditor, { type DesmosEditorHandle } from "./DesmosEditor";
import StudyScreen from "./startScreen";
import EndScreen from "./endScreen";
import { parseExpression } from "../lib/expressionParser";
import { firstDefined } from "../lib/sampledGraph";
import { TEMPLATES } from "../lib/desmosTemplates";
import { Score } from "../lib/GraphScoring";
import type { DayPuzzle } from "../lib/puzzleLoader";
import {
  currentStreak,
  fnFromSamples,
  markStarted,
  recordPlay,
  sampleFn,
  type Save,
} from "../lib/storage";
import type { GraphFn, ScoreRes } from "../types";

type Phase = "intro" | "study" | "play" | "result";
type Parsed = { fn: GraphFn } | { error: string };

interface Props {
  day: DayPuzzle;
  mode: "daily" | "practice";
  save: Save;
  onSave: (s: Save) => void;
  onHome: () => void;
  onRetry?: () => void;
}

const page = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  background: "#ffffff",
  color: "#222222",
} as const;

export default function Game({
  day,
  mode,
  save,
  onSave,
  onHome,
  onRetry,
}: Props) {
  const puzzle = day.puzzle;
  const practice = mode === "practice";

  const target = useMemo<Parsed>(() => {
    const fns: GraphFn[] = [];
    for (const t of puzzle.targets) {
      const r = parseExpression(t);
      if (!r.ok)
        return {
          error: `${t}: ${r.error}`,
        };
      fns.push(r.fn);
    }
    return { fn: firstDefined(fns) };
  }, [puzzle]);

  const prior = practice ? undefined : save.daily[day.dateKey];
  const hasRes = !!(prior && prior.score && prior.ys);
  const [phase, setPhase] = useState<Phase>(() =>
    hasRes
      ? "result"
      : !practice && save.started[day.dateKey]
        ? "play"
        : "intro",
  );
  const [score, setScore] = useState<ScoreRes | null>(() =>
    hasRes ? prior!.score! : null,
  );
  const [player, setPlayer] = useState<GraphFn | null>(() =>
    hasRes ? fnFromSamples(prior!.ys!, puzzle.viewport) : null,
  );
  const [msg, setMsg] = useState("");
  const editorRef = useRef<DesmosEditorHandle>(null);

  if ("error" in target) return <p>Bad puzzle: {target.error}</p>;

  const streak = practice
    ? 0
    : currentStreak(Object.keys(save.daily), day.dateKey);

  const start = () => {
    if (!practice) onSave(markStarted(save, day.dateKey));
    setPhase("study");
  };

  const submit = async () => {
    const curves = await editorRef.current?.sample();
    if (!curves || curves.length === 0)
      return setMsg("Add at least one function first");
    const pf = firstDefined(curves);
    const sc = Score(target.fn, pf, puzzle.viewport);
    setPlayer(() => pf);
    setScore(sc);

    const rec = {
      dateKey: day.dateKey,
      number: day.number,
      total: sc.total,
      score: sc,
      ys: sampleFn(pf, puzzle.viewport),
    };
    if (practice) {
      const old = save.practice[day.dateKey];
      if (!old || sc.total > old.total)
        onSave(recordPlay(save, "practice", rec));
    } else if (!prior?.score) {
      onSave(recordPlay(save, "daily", rec));
    }
    setPhase("result");
  };

  if (phase === "intro") {
    return (
      <div
        style={{
          ...page,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <h1>
          GRAPHLE #{day.number}
          {practice ? "(practice)" : ""}
        </h1>
        <p>
          {puzzle.difficulty}: study for {puzzle.studyTime}s, then rebuild it
          from memory
        </p>
        {streak > 0 && <p>Streak: {streak}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onHome}>Back</button>
          <button className="primary" onClick={start}>
            Start
          </button>
        </div>
      </div>
    );
  }

  if (phase === "study") {
    return (
      <StudyScreen
        puzzle={puzzle}
        target={target.fn}
        onDone={() => setPhase("play")}
      />
    );
  }

  if (phase === "play") {
    return (
      <div style={page}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <DesmosEditor
            ref={editorRef}
            viewport={puzzle.viewport}
            hideGrid={puzzle.hideGrid}
          />
        </div>
        <div
          style={{
            padding: 12,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            background: "#f1f1f1",
            borderTop: "1px solid #dcdcdc",
          }}
        >
          {puzzle.allowTemplates &&
            TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => editorRef.current?.addTemplate(t.id)}
              >
                {t.label}
              </button>
            ))}
          <button onClick={() => editorRef.current?.undo()}>Undo</button>
          <button onClick={() => editorRef.current?.redo()}>Redo</button>
          <button onClick={() => editorRef.current?.clear()}>Clear</button>
          <button className="primary" onClick={submit}>
            Submit
          </button>
          <span>{msg}</span>
        </div>
      </div>
    );
  }

  if (!score || !player) return null;
  return (
    <EndScreen
      dayNumber={day.number}
      puzzle={puzzle}
      target={target.fn}
      player={player}
      score={score}
      streak={streak}
      practice={practice}
      homeLabel={practice ? "Back to archive" : "Menu"}
      onHome={onHome}
      onRetry={practice ? onRetry : undefined}
      onReplay={
        import.meta.env.DEV && !practice
          ? () => {
              setScore(null);
              setPlayer(null);
              setMsg("");
              setPhase("intro");
            }
          : undefined
      }
    />
  );
}
