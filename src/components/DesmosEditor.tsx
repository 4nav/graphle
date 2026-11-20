import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { GraphFn, Viewport } from "../types";
import { sampledToGraphFn } from "../lib/sampledGraph";
import { TEMPLATES } from "../lib/desmosTemplates";

declare const Desmos: any;

const N = 1001;

export interface DesmosEditorHandle {
    sample: () => Promise<GraphFn[]>;
    addTemplate: (id:string) => void;
    undo: () => void;
    redo: () => void;
    clear: () => void;
}

interface Props{
    viewport: Viewport;
    hideGrid?:boolean;
}

// things that mean "not a plain curve": equations, inequalities, points, lists
const NOT_A_CURVE = /[=<>,\[\]]|\\(?:le|ge|ne)(?![a-z])/;

function truefunc(latex: string): string | null {
    // explicit form: "y=..." or "f(x)=..." (Desmos writes f\left(x\right)=...)
    const m = latex.match(/^\s*(?:y|[a-zA-Z](?:_\{[^}]*\})?(?:\\left)?\(x(?:\\right)?\))\s*=\s*(.+)$/);
    if (m) return m[1];

    // bare form: an expression in x, like (x-1)(x-2)(x-3), is a curve in Desmos too
    const core = latex.replace(/\\left\\\{[\s\S]*?\\right\\\}/g, ""); // ignore {x<0} domain restrictions
    if (/x/.test(core) && !NOT_A_CURVE.test(core)) return latex;
    return null;
}

const DesmosEditor = forwardRef<DesmosEditorHandle, Props>(function DesmosEditor(
    {viewport, hideGrid = false},
    ref
){
    const elRef = useRef<HTMLDivElement>(null);
    const calcRef = useRef<any>(null);
    const viewportRef = useRef(viewport);
    viewportRef.current = viewport;

    useEffect(() => {
        if(!elRef.current)return;
        calcRef.current = Desmos.GraphingCalculator(elRef.current, {
            settingsMenu: false,
            zoomButtons: false,
            expressionsTopbar: false,
            keypad: false,
        });
        return () => {
            calcRef.current?.destroy();
            calcRef.current = null;
        };
    }, []);

    const {xMin, xMax, yMin, yMax} = viewport;
    useEffect(() => {
        const calc = calcRef.current;
        if(!calc)return;
        calc.setMathBounds({left: xMin, right: xMax, bottom: yMin, top: yMax});
        const step = (xMax - xMin) / (N - 1);
        calc.setExpression({
            id: "S",
            latex: `S=${xMin}+\\left[0...${N - 1}\\right]\\cdot${step}`,
            hidden: true,
            secret: true,
        });
        calc.clearHistory();
    }, [xMin, xMax, yMin, yMax]);

    useEffect(() => {
        calcRef.current?.updateSettings({showGrid: !hideGrid});
    }, [hideGrid]);

    useImperativeHandle(ref, () => ({
        sample: () => new Promise<GraphFn[]>((resolve) => {
            const calc = calcRef.current;
            if(!calc)return resolve([]);

            const bodies: string[] = [];
            for(const e of calc.getState().expressions.list){
                if(e.type !== "expression" || !e.latex || e.hidden || e.secret)continue;
                if(String(e.id).startsWith("__"))continue;
                const body = truefunc(e.latex);
                if(body)bodies.push(body);
            }
            if(bodies.length === 0)return resolve([]);
            console.log("[sample] bodies:", bodies);
            console.log("[sample] state list:", calc.getState().expressions.list);

            const {xMin, xMax} = viewportRef.current;
            calc.setExpression({
                id: "S",
                latex: `S=${xMin}+\\left[0...${N-1}\\right]\\cdot${(xMax-xMin) / (N-1)}`,
                hidden: true,
                secret: true,
            });
            const res: (number[] | null)[] = bodies.map(() => null);
            const helpers: any[] = [];
            const ids: string[] = [];
            let pending = bodies.length;
            let done = false;

            const finish = () => {
                if(done)return;
                done = true;
                clearTimeout(timer);
                helpers.forEach((h) => h.unobserve("listValue"));
                calc.removeExpressions(ids.map((id) => ({ id })));
                const fns = res.filter((f): f is number[] => f!==null).map((f) => sampledToGraphFn(f, xMin, xMax));
                resolve(fns);
            };
            const timer = setTimeout(() => {console.log("[sample] timed out, still pending:", pending);finish();}, 2000);

            bodies.forEach((body, i) => {
                const id =  `__q${i}`;
                ids.push(id);

                calc.setExpression({id, latex: `Q_{${i}}(x)=${body}`, hidden: true, secret: true});
                const h = calc.HelperExpression({latex: `Q_{${i}}(S)`});
                helpers.push(h);
                h.observe("listValue", () => {
                    console.log("[sample] observe fired", i, h.listValue && h.listValue.length);
                    if(res[i] || !h.listValue)return;
                    res[i] = h.listValue;
                    if(--pending === 0)finish();
                });
            });
        }),
        addTemplate:(id:string) => {
            const calc = calcRef.current;
            const t = TEMPLATES.find((t) => t.id === id);
            if(!calc || !t)return;

            const state = calc.getState();
            const ids = new Set(t.exprs.map((e) => e.id));

            const list = state.expressions.list.filter((e:any) => !ids.has(e.id));

            for(const e of t.exprs){
                const ex: any = {type: "expression", id: e.id, latex: e.latex};
                if(e.color)ex.color = e.color;
                if(e.hidden){ex.hidden = true; ex.secret = true;}
                if(e.drag){
                    ex.dragMode = Desmos.DragModes.XY;
                    ex.showLabel = true;
                    ex.label = e.label??"drag";
                }
                if(e.dashed)ex.lineStyle = Desmos.Styles.DASHED;
                if(e.slider){
                    ex.sliderBounds = {
                        min: String(e.slider[0]),
                        max: String(e.slider[1]),
                        step: String(e.slider[2]),
                    };
                }
                list.push(ex);
            }
            state.expressions.list = list;
            calc.setState(state, {allowUndo: true});
        },
        undo: () => calcRef.current?.undo(),
        redo: () => calcRef.current?.redo(),
        clear: () => {
            const calc = calcRef.current;
            if(!calc)return;
            const {xMin, xMax, yMin, yMax} = viewportRef.current;
            calc.setBlank({allowUndo: true});
            calc.setMathBounds({left: xMin, right: xMax, bottom: yMin, top: yMax});
        },
    }));

    return <div ref={elRef} style={{width: "100%", height: "100%"}}/>;
});

export default DesmosEditor