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

  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState<ScoreRes | null>(null);
  const [msg, setMsg] = useState("");
  const editorRef = useRef<DesmosEditorHandle>(null);

  if ("error" in target)
    return <p style={{ color: "#c9cdd4" }}>Bad puzzle: {target.error}</p>;

  const submit = async () => {
    const curves = await editorRef.current?.sample();
    if (!curves || curves.length === 0)
      return setMsg("Add at least one function first");
    setScore(Score(target.fn, firstDefined(curves), puzzle.viewport));
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
        <h1>PEAK #{day.number}</h1>
        <p>
          {puzzle.difficulty}: study for {puzzle.studyTime}s, then rebuild it
        </p>
        <button onClick={() => setPhase("study")}>Start</button>
      </div>
    );
  }

  if (phase === "study") {
    return (
      <StudyScreen
        puzzle={puzzle}
        target={target.fn}
        onDone={() => setPhase("play")}
      ></StudyScreen>
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
          ></DesmosEditor>
        </div>
        <div
          style={{
            padding: 12,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
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
  return (
    <div
      style={{
        ...page,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <h1>{score?.total}/100</h1>
      <p>
        shape {score?.shape} | turning {score?.turning ?? "n/a"} | intercepts{" "}
        {score?.intercepts ?? "n/a"}
      </p>
      <p>{score?.slices.map((c) => c.toFixed(2)).join(" ")}</p>
      <button
        onClick={() => {
          setScore(null);
          setMsg("");
          setPhase("intro");
        }}
      >
        Play again
      </button>
    </div>
  );
}
