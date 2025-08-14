// app/jeux/snake/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 20;     // taille d'une case
const COLS = 20;
const ROWS = 20;

type Pt = { x: number; y: number };

export default function Snake() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dir, setDir] = useState<Pt>({ x: 1, y: 0 });
  const [snake, setSnake] = useState<Pt[]>([{ x: 5, y: 10 }, { x: 4, y: 10 }]);
  const [food, setFood] = useState<Pt>({ x: 12, y: 10 });
  const [alive, setAlive] = useState(true);
  const [score, setScore] = useState(0);

  // clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!alive) return;
      if (e.key === "ArrowUp"    && dir.y !==  1) setDir({ x: 0, y: -1 });
      if (e.key === "ArrowDown"  && dir.y !== -1) setDir({ x: 0, y:  1 });
      if (e.key === "ArrowLeft"  && dir.x !==  1) setDir({ x: -1, y: 0 });
      if (e.key === "ArrowRight" && dir.x !== -1) setDir({ x:  1, y: 0 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dir, alive]);

  // loop
  useEffect(() => {
    if (!alive) return;
    const id = setInterval(() => {
      setSnake((sn) => {
        const head = { x: sn[0].x + dir.x, y: sn[0].y + dir.y };

        // murs
        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) {
          setAlive(false);
          return sn;
        }
        // auto-collision
        if (sn.some((p) => p.x === head.x && p.y === head.y)) {
          setAlive(false);
          return sn;
        }

        const eat = head.x === food.x && head.y === food.y;
        const ns = [head, ...sn];
        if (!eat) ns.pop();
        else {
          setScore((s) => s + 1);
          // new food
          let fx = Math.floor(Math.random() * COLS);
          let fy = Math.floor(Math.random() * ROWS);
          while (ns.some((p) => p.x === fx && p.y === fy)) {
            fx = Math.floor(Math.random() * COLS);
            fy = Math.floor(Math.random() * ROWS);
          }
          setFood({ x: fx, y: fy });
        }
        return ns;
      });
    }, 120);

    return () => clearInterval(id);
  }, [dir, alive, food]);

  // draw
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    // fond
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, c.width, c.height);
    // snake
    ctx.fillStyle = "#0f0";
    snake.forEach((p) => ctx.fillRect(p.x * SIZE, p.y * SIZE, SIZE - 1, SIZE - 1));
    // food
    ctx.fillStyle = "#f33";
    ctx.fillRect(food.x * SIZE, food.y * SIZE, SIZE - 1, SIZE - 1);
  }, [snake, food]);

  function reset() {
    setSnake([{ x: 5, y: 10 }, { x: 4, y: 10 }]);
    setDir({ x: 1, y: 0 });
    setFood({ x: 12, y: 10 });
    setScore(0);
    setAlive(true);
  }

  return (
    <main className="px-6 py-20 text-white">
      <h1 className="text-3xl font-bold mb-2">Jeu : Snake</h1>
      <p className="mb-4 text-white/80">Utilise les flèches ← ↑ → ↓ pour jouer.</p>
      <div className="flex items-center gap-4 mb-4">
        <div>Score : <b>{score}</b></div>
        {!alive && <button onClick={reset} className="rounded-md border border-white/30 px-3 py-1 hover:bg-white/10">Rejouer</button>}
      </div>
      <canvas ref={canvasRef} width={COLS * SIZE} height={ROWS * SIZE} className="rounded-lg border border-white/20 bg-black" />
    </main>
  );
}
