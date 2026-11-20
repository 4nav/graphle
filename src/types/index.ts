export type GraphFn = (x: number) => number | null

export interface Viewport{
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}

export type Difficulty = "easy" | "medium" | "hard";

export type Mode = "daily" | "practice";

export interface KeyFeatures {
    roots?: number[];
    peaks?: number[];
    valleys?: number[];
}


export interface Puzzle {
    id: number;
    difficulty: Difficulty;
    viewport: Viewport;
    targets: string[];
    studyTime: number;
    allowTemplates: boolean;
    hideGrid: boolean;
    isTutorial: boolean;
    keyFeatures?:KeyFeatures;
}

export interface ScoreRes{
    total: number;
    shape: number;
    turning: number | null;
    intercepts: number | null;
    slices: number[];
    worstX: number[];
}