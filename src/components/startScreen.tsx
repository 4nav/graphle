import { useEffect, useMemo, useRef, useState } from "react";
import GraphBoard from "./graphBoard";
import type { GraphFn, Puzzle } from "../types";

interface Props {
    puzzle: Puzzle;
    target: GraphFn;
    onDone: () => void;
}

export default function StudyScreen({puzzle, target, onDone}: Props){
    const total = puzzle.studyTime;
    const [left, setLeft] = useState(total);
    const doneRef = useRef(onDone);
    doneRef.current = onDone;

    useEffect(() => {
        const end = Date.now() + total * 1000;
        const timer = setInterval(() => {
            const rem = (end - Date.now()) / 1000;
            if(rem <= 0){
                clearInterval(timer);
                doneRef.current();
            }else{
                setLeft(rem);
            }
        },100);
        return () => clearInterval(timer);
    }, [total]);
    const curves = useMemo(() => [{id: "target", fn: target, color:"#fa7e19" }], [target]);

    return(
        <div style={{display: "flex", flexDirection: "column", height: "100vh", background: "#ffffff", color: "#222222"}}>
            <div style={{padding: 12, textAlign: "center", fontSize: 20}}>
                Memorize This: {left.toFixed(1)}s
            </div>
            <div style={{flex: 1, minHeight: 0}}>
                <GraphBoard viewport={puzzle.viewport} curves={curves} hideGrid={puzzle.hideGrid} interactive={false}></GraphBoard>
            </div>
            <div style={{height: 6, background: "#e6e6e6"}}>
                <div style={{ height: "100%", width: `${(left / total) * 100}%`, background: "#fa7e19" }} />
            </div>
        </div>
    )
}