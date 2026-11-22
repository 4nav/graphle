import { useEffect, useState, useRef } from "react";
import JXG from "jsxgraph";
import "../../node_modules/jsxgraph/distrib/jsxgraph.css";
import type { GraphFn, Viewport } from "../types";

export interface Curve {
  id: string;
  fn: GraphFn;
  color: string;
}

interface Props {
  viewport: Viewport;
  curves: Curve[];
  hideGrid?: boolean;
  interactive?: boolean;
  gap?: { a: GraphFn; b: GraphFn; color?: string };
  markers?: number[];
}

const bbox = (v: Viewport): [number, number, number, number] => [
  v.xMin,
  v.yMax,
  v.xMax,
  v.yMin,
];

let cnt = 0;

export default function GraphBoard({
  viewport,
  curves,
  hideGrid = false,
  interactive = true,
  gap,
  markers,
}: Props) {
  const [id] = useState(() => `jxg-board-${cnt++}`);
  const boardRef = useRef<JXG.Board | null>(null);
  const drawnRef = useRef<JXG.GeometryElement[]>([]);

  //draw the board
  useEffect(() => {
    const board = JXG.JSXGraph.initBoard(id, {
      boundingBox: bbox(viewport),
      axis: true,
      grid: !hideGrid,
      showCopyright: false,
      showNavigation: false,
      pan: { enabled: interactive },
      zoom: { wheel: interactive, needShift: false },
    });
    boardRef.current = board;
    return () => {
      JXG.JSXGraph.freeBoard(board);
      boardRef.current = null;
      drawnRef.current = [];
    };
  }, [id, hideGrid, interactive]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    drawnRef.current.forEach((el) => board.removeObject(el));
    drawnRef.current = curves.map((c) =>
      board.create("functiongraph", [(x: number) => c.fn(x) ?? NaN], {
        strokeColor: c.color,
        strokeWidth: 3,
        highlight: false,
      }),
    );
  }, [curves, hideGrid, interactive]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const els: JXG.GeometryElement[] = [];
    const { xMin, xMax, yMin, yMax } = viewport;
    const lo = yMin - (yMax - yMin);
    const hi = yMax + (yMax - yMin);
    const clamp = (y: number) => Math.min(hi, Math.max(lo, y));

    if (gap) {
      const N = 300;
      let xs: number[] = [];
      let ya: number[] = [];
      let yb: number[] = [];

      const flush = () => {
        if (xs.length > 1) {
          const px = [...xs, ...xs.slice().reverse()];
          const py = [...ya, ...yb.slice().reverse()];
          els.push(
            board.create("curve", [px, py], {
              fillColor: gap.color ?? "#c74440",
              fillOpacity: 0.25,
              strokeWidth: 0,
              highlight: false,
            }),
          );
        }
        xs = [];
        ya = [];
        yb = [];
      };
      for (let i = 0; i <= N; ++i) {
        const x = xMin + (i / N) * (xMax - xMin);
        const a = gap.a(x);
        const b = gap.b(x);
        if (a === null || b === null) {
          flush();
          continue;
        }
        xs.push(x);
        ya.push(clamp(a));
        yb.push(clamp(b));
      }
      flush();
    }

    for (const x of markers ?? []) {
      els.push(
        board.create(
          "line",
          [
            [x, 0],
            [x, 1],
          ],
          {
            straightFirst: true,
            straightLast: true,
            strokeColor: "#c74440",
            strokeWidth: 1,
            dash: 2,
            fixed: true,
            highlight: false,
          },
        ),
      );
    }
    return () => {
      if (boardRef.current === board) {
        els.forEach((el) => board.removeObject(el));
      }
    };
  }, [gap, markers, viewport, hideGrid, interactive]);

  const { xMin, xMax, yMin, yMax } = viewport;
  useEffect(() => {
    boardRef.current?.setBoundingBox([xMin, yMax, xMax, yMin], false);
  }, [xMin, xMax, yMin, yMax]);

  return <div id={id} style={{ width: "100%", height: "100%" }}></div>;
}
