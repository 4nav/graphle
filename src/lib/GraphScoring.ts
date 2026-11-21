import type { GraphFn, ScoreRes, Viewport } from "../types";

export const SLICES = 8;

const SAMPLES = 400;
const SIGMA_SHAPE = 0.12;
const SIGMA_FEATURE = 0.07;
const PROMINENCE = 0.03;
const MARGIN = 0.5;
const WEIGHTS = {shape: 0.7, turning: 0.15, intercepts: 0.15};

type Feat = { kind: "max" | "min" | "root" | "yint"; x:number;y:number};
const isTurn = (f:Feat) => f.kind === "max" || f.kind === "min";
const isIcpt = (f:Feat) => f.kind ==="root" || f.kind === "yint";

export function Score(target: GraphFn, player: GraphFn, vp: Viewport): ScoreRes{
    const W = vp.xMax - vp.xMin;
    const H = vp.yMax - vp.yMin;
    const lo = vp.yMin - MARGIN*H;
    const hi = vp.yMax + MARGIN*H;
    const clamp = (y:number| null) => (y === null ? null: Math.min(hi, Math.max(lo,y)));

    const xs: number[] = [];
    const ty: (number | null)[] = [];
    const py: (number | null)[] = [];
    for(let i = 0; i < SAMPLES; ++i){
        const x = vp.xMin + (i / (SAMPLES-1))*W;
        xs.push(x);
        ty.push(clamp(target(x)));
        py.push(clamp(player(x)));
    }

    const close = xs.map((_, i) => {
        const a= ty[i];
        const b= py[i];
        if(a===null && b===null)return 1;
        if(a === null || b === null)return 0;
        const z = (a-b) / H / SIGMA_SHAPE;
        return Math.exp(-z * z);
    });
    const shape = (100 * close.reduce((s,v) => s+v,0))/close.length;

    const slices:number[] = [];
    const sliceWorstX: number[] = [];
    for(let s = 0; s< SLICES; ++s){
        const from = Math.floor((s * SAMPLES) / SLICES);
        const to = Math.floor(((s + 1)*SAMPLES)/SLICES);
        let sum = 0;
        let worst = from;
        for(let i = from; i < to; ++i){
            sum += close[i];
            if(close[i] < close[worst])worst=i;
        }
        slices.push(sum /(to - from));
        sliceWorstX.push(xs[worst]);
    }
    const WorstX = slices.map((c,s) => ({c,x:sliceWorstX[s]})).filter((o) => o.c < 0.7).sort((a,b) => a.c - b.c).slice(0,3).map((o) => o.x);

    const tf = features(target,xs,ty,vp);
    const pf = features(player, xs, py,vp);
    const turning = featureScore(tf.filter(isTurn), pf.filter(isTurn),W,H);
    const intercepts = featureScore(tf.filter(isIcpt), pf.filter(isIcpt), W, H);

    const parts: [number, number | null][] = [
        [WEIGHTS.shape, shape],
        [WEIGHTS.turning, turning],
        [WEIGHTS.intercepts, intercepts],
    ];
    let wSum = 0;
    let tot = 0;
    for(const [w,v] of parts){
        if(v!== null){
            wSum += w;
            tot += w * v;
        }
    }
    const r = (v:number | null) => (v === null ? null : Math.round(v));
    return{
        total: Math.round(tot/wSum),
        shape: Math.round(shape),
        turning: r(turning),
        intercepts: r(intercepts),
        slices,
        worstX: WorstX,
    };
}

function features(fn: GraphFn, xs: number[], ys:(number | null)[], vp: Viewport): Feat[]{
    const H = vp.yMax - vp.yMin;
    const inView = (y:number) => y >= vp.yMin && y <= vp.yMax;
    const out: Feat[] = [];

    const turns = findTurns(xs, ys, PROMINENCE*H).filter((f) => inView(f.y));
    out.push(...turns);

    if(vp.yMin < 0 && vp.yMax > 0){
        for(let i = 0; i + 1 < xs.length; ++i){
            const a = ys[i];
            const b = ys[i+1];
            if(a===null || b===null)continue;
            if(((a < 0 && b > 0) || (a > 0 && b < 0)) && Math.abs(a-b) < 0.5*H){
                const t = a/(a-b);
                out.push({kind: "root", x:xs[i] + t*(xs[i + 1] - xs[i]), y:0});
            }
        }
        for(const f of turns){
            if(Math.abs(f.y) < 0.01*H)out.push({kind: "root", x:f.x, y:0});
        }
    }
    if(vp.xMin <= 0 && vp.xMax >=0){
        const  y0 = fn(0);
        if(y0 !== null && inView(y0)){
            out.push({kind: "yint", x:0, y:y0});
        }
    }
    return out;
}

function findTurns(xs: number[], ys: (number | null)[], thr: number): Feat[]{
    const out: Feat[] = [];
    let s = 0;
    while(s < ys.length){
        if(ys[s] === null){
            s++;
            continue;
        }
        let e = s;
        while(e < ys.length && ys[e] !== null)e++;
        zigzag(xs, ys as number[], s,e,thr,out);
        s = e;
    }
    return out;
}

function zigzag(xs: number[], ys: number[], s: number, e: number, thr: number, out: Feat[]){
    let hi = s;
    let lo = s;
    let dir = 0;
    const push = (i:number, kind: "max" | "min") => {
        if(i > s)out.push({kind, x:xs[i], y: ys[i]});
    };
    for(let i = s+1; i < e; ++i){
        const y = ys[i];
        if(dir=== 0){
            if(y > ys[hi])hi = i;
            if(y < ys[lo])lo = i;
            if(ys[hi] - y >= thr){
                push(hi, "max");
                dir = -1;
                lo = i;
            } else if(y - ys[lo] >= thr){
                push(lo, "min");
                dir = 1;
                hi = i;
            }
        } else if(dir === 1){
            if(y > ys[hi])hi = i;
            else if (ys[hi] - y >= thr){
                push(hi, "max");
                dir = -1;
                lo = i;
            }
        } else{
            if(y < ys[lo])lo = i;
            else if(y - ys[lo] >= thr){
                push(lo, "min");
                dir = 1;
                hi = i;
            }
        }
    }
}

function featureScore(target: Feat[], player: Feat[], W: number, H: number): number | null{
    if(target.length === 0)return null;
    const credit = (a:Feat, b: Feat) => {
        if(a.kind !== b.kind)return 0;
        const d = Math.hypot((a.x - b.x)/W, (a.y - b.y)/H) / SIGMA_FEATURE;
        return Math.exp(-d * d);
    };
    const best = (f:Feat, pool:Feat[]) => pool.reduce((m,g) => Math.max(m, credit(f,g)),0);
    const mean = (a:number[]) => a.reduce((s,v) => s+v,0) / a.length;
    const recall = mean(target.map((f) => best(f,player)));
    const precision = player.length ? mean(player.map((f) => best(f,target))) : 0;
    return (100 * (recall + precision))/2;
}