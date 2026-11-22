export interface TemplateExpr {
  id: string;
  latex: string;
  color?: string;
  hidden?: boolean;
  drag?: boolean;
  label?: string;
  slider?: [number, number, number];
  dashed?: boolean;
}

export interface Template {
  id: string;
  label: string;
  exprs: TemplateExpr[];
}

const r = String.raw;
const RED = "#c74440";
const BLUE = "#2d70b3";
const GREEN = "#388c46";
const ORANGE = "#fa7e19";
const PURPLE = "#6042a6";

const S10: [number, number, number] = [-10, 10, 0.1];

export const TEMPLATES: Template[] = [
  {
    id: "line",
    label: "Line",
    exprs: [
      { id: "line_x1", latex: "x_{3}=-2", slider: S10 },
      { id: "line_y1", latex: "y_{3}=-1", slider: S10 },
      { id: "line_x2", latex: "x_{4}=2", slider: S10 },
      { id: "line_y2", latex: "y_{4}=3", slider: S10 },
      {
        id: "line_fn",
        latex: r`L_{1}(x)=y_{3}+\frac{y_{4}-y_{3}}{x_{4}-x_{3}}\cdot\left(x-x_{3}\right)`,
        color: GREEN,
      },
      { id: "line_p1", latex: "(x_{3},y_{3})", color: GREEN, drag: true },
      { id: "line_p2", latex: "(x_{4},y_{4})", color: GREEN, drag: true },
    ],
  },
  {
    id: "parabola",
    label: "Parabola",
    exprs: [
      { id: "par_h", latex: "h_{1} = 0", slider: S10 },
      { id: "par_k", latex: "k_{1}=0", slider: S10 },
      { id: "par_a", latex: "a_{1}=1", slider: [-3, 3, 0.1] },
      {
        id: "par_fn",
        latex: r`f_{1}(x)=a_{1}\cdot\left(x-h_{1}\right)^2+k_{1}`,
        color: ORANGE,
      },
      {
        id: "par_v",
        latex: "(h_{1}, k_{1})",
        color: ORANGE,
        drag: true,
        label: "vertex",
      },
    ],
  },
  {
    id: "cubic",
    label: "Cubic",
    exprs: [
      { id: "cub_x1", latex: "x_{1}=-1", slider: S10 },
      { id: "cub_y1", latex: "y_{1}=2", slider: S10 },
      { id: "cub_x2", latex: "x_{2}=1", slider: S10 },
      { id: "cub_y2", latex: "y_{2}=-2", slider: S10 },
      {
        id: "cub_w",
        latex: r`w_{1}=\frac{2(y_{2}-y_{1})}{(x_{1}-x_{2})^3}`,
        hidden: true,
      },
      {
        id: "cub_p",
        latex: r`P_{1}(x)=x^3-1.5\cdot(x_{1}+x_{2})\cdot x^2+3\cdot x_{1}\cdot x_{2}\cdot x`,
        hidden: true,
      },
      {
        id: "cub_fn",
        latex: r`v_{1}(x)=w_{1}\cdot\left(P_{1}(x)-P_{1}(x_{1})\right)+y_{1}`,
        color: PURPLE,
      },
      {
        id: "cub_t1",
        latex: "(x_{1}, y_{1})",
        color: PURPLE,
        drag: true,
        label: "turn",
      },
      {
        id: "cub_t2",
        latex: "(x_{2}, y_{2})",
        color: PURPLE,
        drag: true,
        label: "turn",
      },
    ],
  },
  {
    id: "abs",
    label: "Abs value",
    exprs: [
      { id: "abs_h", latex: "h_{2}=0", slider: S10 },
      { id: "abs_k", latex: "k_{2}=0", slider: S10 },
      { id: "abs_p", latex: "p_{2}=2", slider: S10 },
      { id: "abs_q", latex: "q_{2}=2", slider: S10 },
      {
        id: "abs_a",
        latex: r`a_{2}=\frac{q_{2}-k_{2}}{\left|p_{2}-h_{2}\right|}`,
        hidden: true,
      },
      {
        id: "abs_fn",
        latex: r`A_{1}(x)=a_{2}\cdot\left|x-h_{2}\right|+k_{2}`,
        color: RED,
      },
      {
        id: "abs_v",
        latex: "(h_{2}, k_{2})",
        color: RED,
        drag: true,
        label: "vertex",
      },
      {
        id: "abs_s",
        latex: "(p_{2}, q_{2})",
        color: RED,
        drag: true,
        label: "slope",
      },
    ],
  },
  {
    id: "sine",
    label: "Sine / cosine",
    exprs: [
      { id: "sin_x1", latex: "x_{5}=0", slider: S10 },
      { id: "sin_y1", latex: "y_{5}=2", slider: S10 },
      { id: "sin_x2", latex: "x_{6}=2", slider: S10 },
      { id: "sin_y2", latex: "y_{6}=-2", slider: S10 },
      {
        id: "sin_fn",
        latex: r`W_{1}(x)=\frac{y_{5}+y_{6}}{2}+\frac{y_{5}-y_{6}}{2}\cdot\cos\left(\frac{\pi}{x_{6}-x_{5}}\cdot\left(x-x_{5}\right)\right)`,
        color: BLUE,
      },
      {
        id: "sin_p1",
        latex: "(x_{5}, y_{5})",
        color: BLUE,
        drag: true,
        label: "peak",
      },
      {
        id: "sin_p2",
        latex: "(x_{6},y_{6})",
        color: BLUE,
        drag: true,
        label: "trough",
      },
    ],
  },
  {
    id: "exp",
    label: "Exponential",
    exprs: [
      { id: "exp_xp", latex: "x_{7}=0", slider: S10 },
      { id: "exp_yp", latex: "y_{7}=3", slider: S10 },
      { id: "exp_xd", latex: "x_{8}=-4", slider: S10 },
      { id: "exp_d", latex: "d_{3}=0", slider: S10 },
      { id: "exp_k", latex: "k_{3}=0.4", slider: [-2, 2, 0.05] },
      {
        id: "exp_fn",
        latex: r`E_{1}(x)=d_{3}+\left(y_{7}-d_{3}\right)\cdot e^{k_{3}\cdot\left(x-x_{7}\right)}`,
        color: GREEN,
      },
      { id: "__exp_asym", latex: "y=d_{3}", color: GREEN, dashed: true },
      {
        id: "exp_p",
        latex: "(x_{7}, y_{7})",
        color: GREEN,
        drag: true,
        label: "curve",
      },
      {
        id: "exp_f",
        latex: "(x_{8},d_{3})",
        color: GREEN,
        drag: true,
        label: "floor",
      },
    ],
  },
  {
    id: "hyper",
    label: "Hyperbola",
    exprs: [
      { id: "hyp_m", latex: "m_{1}=0", slider: S10 },
      { id: "hyp_n", latex: "n_{1}=0", slider: S10 },
      { id: "hyp_p", latex: "p_{4}=2", slider: S10 },
      { id: "hyp_q", latex: "q_{4}=2", slider: S10 },
      {
        id: "hyp_r",
        latex: r`r_{1}=\left(p_{4}-m_{1}\right)\cdot\left(q_{4}-n_{1}\right)`,
        hidden: true,
      },
      {
        id: "hyp_fn",
        latex: r`H_{1}(x)=\frac{r_{1}}{x-m_{1}}+n_{1}`,
        color: "#1a9ea8",
      },
      { id: "__hyp_va", latex: "x=m_{1}", color: "#1a9ea8", dashed: true },
      { id: "__hyp_ha", latex: "y=n_{1}", color: "#1a9ea8", dashed: true },
      {
        id: "hyp_c",
        latex: "(m_{1}, n_{1})",
        color: "#1a9ea8",
        drag: true,
        label: "center",
      },
      {
        id: "hyp_h",
        latex: "(p_{4}, q_{4})",
        color: "#1a9ea8",
        drag: true,
        label: "bend",
      },
    ],
  },
];
