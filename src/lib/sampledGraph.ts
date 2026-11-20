import type { GraphFn } from "../types";

export function sampledToGraphFn(ys: number[], xMin: number, xMax: number): GraphFn{
    const n = ys.length;
    const step = (xMax - xMin) / (n-1);

    return (x) => {
        if(x < xMin || x > xMax)return null;
        const t = (x - xMin) / step;
        const i = Math.min(Math.floor(t), n-2);
        const y0 = ys[i];
        const y1 = ys[i + 1];
        if(!Number.isFinite(y0) || !Number.isFinite(y1))return null;
        return y0 + (y1 - y0) * (t - i);
    };
}

export function firstDefined(fns: GraphFn[]): GraphFn{
    return (x) => {
        for(const fn of fns){
            const y = fn(x);
            if(y!== null)return y;
        }
        return null;
    };
}