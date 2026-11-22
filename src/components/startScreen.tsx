import { useEffect, useMemo, useRef, useState } from "react";
import GraphBoard from "./graphBoard";
import type { GraphFn, Puzzle } from "../types";

interface Props {
  puzzle: Puzzle;
  target: GraphFn;
  label?: string;
  onDone: () => void;
}

export default function StudyScreen({ puzzle, target, label, onDone }: Props) {
  const total = puzzle.studyTime;
  const [left, setLeft] = useState(total);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const end = Date.now() + 100 * total;
    const timer = setInterval(() => {
      const rem = (end - Date.now()) / 1000;
      if (rem <= 0) {
        clearInterval(timer);
        doneRef.current();
      } else {
        setLeft(rem);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [total]);

  const curves = useMemo(
    () => [{ id: "target", fn: target, color: "#fa7e19" }],
    [target],
  );

  return (
    <div
      className="sketch"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        boxSizing: "border-box",
        padding: "14px 20px",
        gap: 10,
        background: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: 200, fontSize: 20 }}>{label}</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, lineHeight: 1 }}>
            Memorise this quick!
          </div>
          <svg
            width="220"
            height="14"
            viewBox="0 0 220 14"
            style={{ display: "block", margin: "2px auto 0" }}
          >
            <path
              d="M3 9 C 30 2, 55 13, 85 7 S 140 3, 165 9 S 200 6, 217 8"
              fill="none"
              stroke="#fa7e19"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ fontSize: 18, color: "#666" }}>just the shape</div>
        </div>
        <div style={{ width: 200, textAlign: "right" }}>
          <span
            style={{
              fontSize: 56,
              lineHeight: 1,
              color: left <= 3 ? "#c74440" : "#2b2b2b",
            }}
          >
            {left.toFixed(1)}
          </span>
          <span style={{ fontSize: 20 }}>sec</span>
        </div>
      </div>
      <div className="sketch-frame" style={{ flex: 1, minHeight: 0 }}>
        <GraphBoard
          viewport={puzzle.viewport}
          curves={curves}
          hideGrid={puzzle.hideGrid}
          interactive={false}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div className="sketch-track" style={{ flex: 1 }}>
          <div
            className="sketch-fill"
            style={{ width: `${(left / total) * 100}%` }}
          />
        </div>
        <button onClick={() => doneRef.current()}>I'm ready</button>
      </div>
    </div>
  );
}
