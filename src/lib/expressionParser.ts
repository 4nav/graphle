import { compile } from "mathjs";
import type { GraphFn } from "../types";

export type ParseRes = {ok: true; fn: GraphFn} | { ok: false; error: string };

export function parseExpression(raw: string): ParseRes{
    //y = blah blah or f(x) = blah blah
    let txt = raw.trim().replace(/^(y|f\(x\))\s*=\s*/i, "");
    if(!txt){
        return{
            ok:false,
            error: "Empty expression"
        };
    }
    txt = txt.replace(/\bx\s*\(/g, "x*(");

    let code;
    try{
        code = compile(txt);
        code.evaluate({x:0.5});
    } catch(e){
        return {ok: false, error: e instanceof Error ? e.message : "Invalid Expression"};
    }

    const fn: GraphFn = (x) => {
        try{
            const y = code.evaluate({x});

            return typeof y === "number" && Number.isFinite(y) ? y: null;
        } catch{
            return null;
        }
    };
    return {
        ok:true,
        fn
    };
}