"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 20;
const COLS = 20;
const ROWS = 20;

type Pt = { x: number; y: number };

export default function SnakeGame() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [dir, setDir] = useState<Pt>({ x: 1, y: 0 });
  const [snake, setSnake] = useState<Pt[]>([{ x: 5, y: 10 }, { x: 4, y: 10 }]);
  const [food, setFood] = useState<Pt>({ x: 12, y: 10 });
  const [alive, setAlive] = useState(true);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => { wrapRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
      if (!alive) return;
      if (e.key === " " || e.key === "Spacebar") { setPaused(p => !p); return; }
      if (paused) return;
      setDir(d => {
        if (e.key === "ArrowUp"    && d.y !==  1) return { x: 0,  y: -1 };
        if (e.key === "ArrowDown"  && d.y !== -1) return { x: 0,  y:  1 };
        if (e.key === "ArrowLeft"  && d.x !==  1) return { x:-1,  y:  0 };
        if (e.key === "ArrowRight" && d.x !== -1) return { x: 1,  y:  0 };
        return d;
      });
    }
    document.addEventListener("keydown", onKey, { passive: false });
    return () => document.removeEventListener("keydown", onKey as any);
  }, [alive, paused]);

  useEffect(() => {
    if (!alive || paused) return;
    const id = setInterval(() => {
      setSnake(sn => {
        const head = { x: sn[0].x + dir.x, y: sn[0].y + dir.y };
        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) { setAlive(false); return sn; }

        const eat = head.x === food.x && head.y === food.y;
        const body = eat ? sn : sn.slice(0, sn.length - 1);
        if (body.some(p => p.x === head.x && p.y === head.y)) { setAlive(false); return sn; }

        const ns = [head, ...sn];
        if (!eat) ns.pop();
        else {
          setScore(s => s + 1);
          let fx = Math.floor(Math.random() * COLS), fy = Math.floor(Math.random() * ROWS);
          while (ns.some(p => p.x === fx && p.y === fy)) { fx = Math.floor(Math.random() * COLS); fy = Math.floor(Math.random() * ROWS); }
          setFood({ x: fx, y: fy });
        }
        return ns;
      });
    }, 120);
    return () => clearInterval(id);
  }, [dir, alive, paused, food]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)";
      ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
    }
    ctx.fillStyle = "#f33";
    ctx.fillRect(food.x * SIZE, food.y * SIZE, SIZE - 1, SIZE - 1);
    ctx.fillStyle = "#10ff6a";
    snake.forEach(p => ctx.fillRect(p.x * SIZE, p.y * SIZE, SIZE - 1, SIZE - 1));
  }, [snake, food]);

  function reset() {
    setSnake([{ x: 5, y: 10 }, { x: 4, y: 10 }]);
    setDir({ x: 1, y: 0 }); setFood({ x: 12, y: 10 });
    setScore(0); setAlive(true); setPaused(false);
    setTimeout(() => wrapRef.current?.focus(), 0);
  }

  function tap(x:number, y:number) {
    if (!alive || paused) return;
    setDir(d => {
      if (x===0 && y===-1 && d.y !==  1) return { x, y };
      if (x===0 && y=== 1 && d.y !== -1) return { x, y };
      if (x===-1&& y=== 0 && d.x !==  1) return { x, y };
      if (x=== 1&& y=== 0 && d.x !== -1) return { x, y };
      return d;
    });
  }

  return (
    <main className="px-6 py-20 text-white">
      <div ref={wrapRef} tabIndex={0} className="mx-auto max-w-fit outline-none">
        <div className="mb-3 flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Snake</h1>
          <div className="text-white/80">Score : <b>{score}</b></div>
          <button onClick={() => setPaused(p => !p)} className="rounded-md border border-white/30 px-3 py-1 hover:bg-white/10" disabled={!alive}>
            {paused ? "Reprendre" : "Pause"}
          </button>
          {!alive && (
            <button onClick={reset} className="rounded-md border border-white/30 px-3 py-1 hover:bg-white/10">Rejouer</button>
          )}
          <div className="text-sm text-white/60">(Espace = Pause)</div>
        </div>

        <canvas ref={canvasRef} width={COLS * SIZE} height={ROWS * SIZE} className="rounded-lg border border-white/20 bg-black" />

        {/* D-pad mobile */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
          <div />
          <button onClick={() => tap(0,-1)} className="rounded-lg border border-white/30 py-3 hover:bg-white/10">↑</button>
          <div />
          <button onClick={() => tap(-1,0)} className="rounded-lg border border-white/30 py-3 hover:bg-white/10">←</button>
          <div />
          <button onClick={() => tap(1,0)} className="rounded-lg border border-white/30 py-3 hover:bg-white/10">→</button>
          <div />
          <button onClick={() => tap(0,1)} className="rounded-lg border border-white/30 py-3 hover:bg-white/10">↓</button>
          <div />
        </div>
      </div>
    </main>
  );
}
