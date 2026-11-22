import { useMemo, useRef, useState } from "react";
import DesmosEditor, {
  type DesmosEditorHandle,
} from "./components/DesmosEditor";
import { parseExpression } from "./lib/expressionParser";
import { firstDefined } from "./lib/sampledGraph";
import { TEMPLATES } from "./lib/desmosTemplates";
import { Score } from "./lib/GraphScoring";
import { puzzleForDate, todayKey } from "./lib/puzzleLoader";
import type { GraphFn, ScoreRes } from "./types";
import StudyScreen from "./components/startScreen";
import EndScreen from "./components/endScreen";
import {
  currentStreak,
  fnFromSamples,
  loadSave,
  markStarted,
  recordPlay,
  sampleFn,
  writeSave,
} from "./lib/storage";

type Phase = "intro" | "study" | "play" | "result";
type Parsed = { fn: GraphFn } | { error: string };

const page = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  background: "#ffffff",
  color: "#222222",
} as const;

export default function App() {
  const day = useMemo(() => puzzleForDate(todayKey()), []);
  const puzzle = day.puzzle;

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

  const [save, setSave] = useState(() => loadSave(day.dateKey));
  const prior = save.daily[day.dateKey];
  const hasRes = !!(prior && prior.score && prior.ys);
  const [phase, setPhase] = useState<Phase>(() =>
    hasRes ? "result" : save.started[day.dateKey] ? "play" : "intro",
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

  const streak = currentStreak(Object.keys(save.daily), day.dateKey);

  const start = () => {
    const next = markStarted(save, day.dateKey);
    setSave(next);
    writeSave(next);
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

    if (!prior?.score) {
      const next = recordPlay(save, "daily", {
        dateKey: day.dateKey,
        number: day.number,
        total: sc.total,
        score: sc,
        ys: sampleFn(pf, puzzle.viewport),
      });
      setSave(next);
      writeSave(next);
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
        <h1>GRAPHLE #{day.number}</h1>
        <p>
          {puzzle.difficulty}: study for {puzzle.studyTime}s, then rebuild it
        </p>
        {streak > 0 && <p>Streak: {streak}</p>}
        <button className="primary" onClick={start}>
          Start
        </button>
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
      onReplay={() => {
        if (!import.meta.env.DEV) return;
        setScore(null);
        setPlayer(null);
        setMsg("");
        setPhase("intro");
      }}
    />
  );
}
