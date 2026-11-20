import { useEffect, useRef, useState } from "react";

declare const Desmos: any;

export default function TestDesmos(){
    const elRef = useRef<HTMLDivElement>(null);
    const [info, setInfo] = useState<{n:number; sample: number[]; err: number | null}>({
        n: 0,
        sample: [],
        err: null,
    });

    useEffect(() => {
        if(!elRef.current)return;

        const calc = Desmos.GraphingCalculator(elRef.current, {
            settingsMenu: false,
            zoomButtons: false,
            expressionsTopbar: false,
            keypad: false,
            invertedColors: true,
        });

        calc.setMathBounds({ left: -10, right: 10, bottom: -10, top: 10 });
        calc.setExpression({ id: "S", latex: "S=[-10,-9.98...10]", hidden: true, secret: true });

        calc.setExpression({ id: "h", latex: "h=0", sliderBounds: { min: -10, max: 10, step: 0.1 } });
        calc.setExpression({ id: "k", latex: "k=0", sliderBounds: { min: -10, max: 10, step: 0.1 } });
        calc.setExpression({ id: "a", latex: "a=1", sliderBounds: { min: -3, max: 3, step: 0.1 } });
        calc.setExpression({
            id: "f",
            latex: "f(x)=a(x-h)^2+k",
            color: Desmos.Colors.ORANGE,
        });
        calc.setExpression({
            id: "vertex",
            latex: "(h,k)",
            color: Desmos.Colors.ORANGE,
            dragMode: Desmos.DragModes.XY,
            showLabel: true,
            label: "Drag me",
        });
        calc.setExpression({
            id: "g",
            latex: "g(x)=0.2(x+2)(x-1)(x-3)",
            hidden: true,
            secret: true,
        });

        let f: number[] = [];
        let g: number[] = [];

        const update = () => {
            const n = Math.min(f.length, g.length);
            if(!n)return;
            let sum = 0;
            let cnt = 0;
            for(let i  = 0; i < n; ++i){
                if(Number.isFinite(f[i]) && Number.isFinite(g[i])){
                    sum += Math.abs(f[i] - g[i]);
                    cnt++;
                }
            }
            setInfo({n: f.length, sample: f.slice(0,5), err: cnt ? sum / cnt: null});
        };
        const hf = calc.HelperExpression({latex: "f(S)"});
        const hg = calc.HelperExpression({ latex: "g(S)" });
        hf.observe("listValue", () => {
            f = hf.listValue;
            update();
        });
        hg.observe("listValue", () => {
            g = hg.listValue;
            update();
        });
        return () => calc.destroy();
    }, []);

    return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div ref={elRef} style={{ flex: 1, minHeight: 0 }} />
      <pre style={{ margin: 0, padding: 12, color: "#c9cdd4", background: "#15161b" }}>
        {`samples read back: ${info.n} first 5 of f(S):    ${info.sample.map((v) => v.toFixed(2)).join(", ")} mean |f - g|:       ${info.err === null ? "n/a" : info.err.toFixed(3)}`}
      </pre>
    </div>
  );
}
