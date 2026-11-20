import { useRef, useState } from "react";
import DesmosEditor, {type DesmosEditorHandle} from "./components/DesmosEditor";
import { parseExpression } from "./lib/expressionParser";
import { firstDefined } from "./lib/sampledGraph";
import type { Viewport } from "./types";
import { TEMPLATES } from "./lib/desmosTemplates";

const VIEWPORT: Viewport = {xMin: -10, xMax: 10, yMin: -10, yMax: 10};

export default function App() {
  const editorRef = useRef<DesmosEditorHandle>(null);
  const [res, setRes] = useState("type a function");

  const submit = async() => {
    const curves = await editorRef.current?.sample();
    if(!curves || curves.length === 0)return setRes("no functions found");

    const target = parseExpression("0.2(x+2)(x-1)(x-3)");
    if(!target.ok)return setRes(target.error);

    const player = firstDefined(curves);
    let sum = 0;
    let cnt = 0;

    for(let i = 0; i<=200; ++i){
      const x = VIEWPORT.xMin + (i/200) * (VIEWPORT.xMax - VIEWPORT.xMin);
      const a = player(x);
      const b = target.fn(x);
      if(a !== null && b !== null){
        sum += Math.abs(a - b);
        cnt++;
      }
    }
    setRes(cnt?
      `curves: ${curves.length} | points compared: ${cnt} | mean |diff|: ${(sum / cnt).toFixed(3)}`:"no overlapping points"
    );
  };
  return(
    <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
      <div style={{flex: 1, minHeight: 0}}>
        <DesmosEditor ref={editorRef} viewport={VIEWPORT}/>
      </div>
      <div style={{padding: 12, background: "#15161b", color: "#c9cdd4", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap"}}>
        <button onClick={submit}>Submit</button>
        <button onClick={() => editorRef.current?.undo()}>Undo</button>
        <button onClick={() => editorRef.current?.redo()}>Redo</button>
        <button onClick={() => editorRef.current?.clear()}>Clear</button>
        {TEMPLATES.map((t)=> (
          <button key={t.id} onClick={() => editorRef.current?.addTemplate(t.id)}>
            {t.label}
          </button>
        ))}
        <span>{res}</span>
      </div>
    </div>
  );
}