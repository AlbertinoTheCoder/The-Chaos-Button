export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  kind: number;
  alive: boolean;
  extra?: number;
}
export interface Input {
  x: number;
  y: number;
  down: boolean;
  clicked: boolean;
  released: boolean;
  startX: number;
  startY: number;
}
export interface SimState {
  time: number;
  score: number;
  health: number;
  goal: number;
  status: string;
  ended: boolean;
  won: boolean;
  objects: Particle[];
  data: Record<string, number>;
  points: { x: number; y: number }[];
}
export interface SimContext {
  ctx: CanvasRenderingContext2D;
  s: SimState;
  p: Input;
  v: number;
  color: string;
  dt: number;
  random: () => number;
}
export const W = 600,
  H = 260;
export function particle(x: number, y: number, kind = 0): Particle {
  return { x, y, vx: 0, vy: 0, r: 10, kind, alive: true };
}
export function circle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
export function text(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  color = '#ddd',
  size = 12,
) {
  ctx.fillStyle = color;
  ctx.font = size + 'px "IBM Plex Mono",monospace';
  ctx.textAlign = 'center';
  ctx.fillText(str, x, y);
}
export function finish(s: SimState, won: boolean, message?: string) {
  s.ended = true;
  s.won = won;
  s.status = message || (won ? 'ANOMALY MASTERED. SOMEHOW.' : 'A VERY EDUCATIONAL FAILURE.');
}
export function initState(): SimState {
  return {
    time: 0,
    score: 0,
    health: 3,
    goal: 10,
    status: '',
    ended: false,
    won: false,
    objects: [],
    data: {},
    points: [],
  };
}
