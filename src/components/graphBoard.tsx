import { useEffect, useState, useRef } from "react";
import JXG from "jsxgraph";
import "../../node_modules/jsxgraph/distrib/jsxgraph.css";
import type { GraphFn, Viewport } from "../types";

export interface Curve {
    id: string;
    fn: GraphFn;
    color: string;
}

interface Props{
    viewport: Viewport;
    curves: Curve[];
    hideGrid?: boolean;
}

const bbox = (v:Viewport): [number, number, number, number] => [v.xMin, v.yMax, v.xMax, v.yMin];

let cnt = 0;

export default function GraphBoard({ viewport, curves, hideGrid = false }: Props){
    const [id] = useState(() => `jxg-board-${cnt++}`);
    const boardRef = useRef<JXG.Board | null>(null);
    const drawnRef = useRef<JXG.GeometryElement[]>([]);

    useEffect(() => {
        const board = JXG.JSXGraph.initBoard(id, {
            boundingBox: bbox(viewport),
            axis: true,
            grid: !hideGrid,
            showCopyright: false,
            showNavigation: false,
            pan: {enabled: true},
            zoom: {wheel: true, needShift: false},
        });
        boardRef.current = board;
        return () => {
            JXG.JSXGraph.freeBoard(board);
            boardRef.current = null;
            drawnRef.current = [];
        };
    }, [id, hideGrid]);

    useEffect(() => {
        const board = boardRef.current;
        if(!board)return;

        drawnRef.current.forEach((el) => board.removeObject(el));
        drawnRef.current = curves.map((c) => 
            board.create("functiongraph", [(x:number) => c.fn(x) ?? NaN], {
                strokeColor: c.color,
                strokeWidth: 3,
                highlight: false,
            })
        );
    }, [curves, hideGrid]);

    const {xMin, xMax, yMin, yMax} = viewport;
    useEffect(() => {
        boardRef.current?.setBoundingBox([xMin, yMax, xMax, yMin], false);
    }, [xMin, xMax, yMin, yMax]);

    return <div id={id} style={{width: "100%", height: "100%"}} />;
}
