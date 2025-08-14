// app/jeux/snake/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const size = 20;
    const cols = Math.floor(canvas.width / size);
    const rows = Math.floor(canvas.height / size);

    let dir = { x: 1, y: 0 };
    let snake = [{ x: 5, y: 5 }];
    let food = { x: 10, y: 10 };
    let alive = true;

    function placeFood() {
      food = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
    }

    function tick() {
      if (!alive) return;
      const head = {
        x: (snake[0].x + dir.x + cols) % cols,
        y: (snake[0].y + dir.y + rows) % rows,
      };
      // collision self
      if (snake.some(s => s.x === head.x && s.y === head.y)) {
        alive = false;
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 1);
        placeFood();
      } else {
        snake.pop();
      }
      draw();
    }

    function draw() {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // food
      ctx.fillStyle = "red";
      ctx.fillRect(food.x * size, food.y * size, size, size);

      // snake
      ctx.fillStyle = "lime";
      for (const s of snake) {
        ctx.fillRect(s.x * size, s.y * size, size, size);
      }
    }

    const id = setInterval(tick, 130);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && dir.y !== 1) dir = { x: 0, y: -1 };
      if (e.key === "ArrowDown" && dir.y !== -1) dir = { x: 0, y: 1 };
      if (e.key === "ArrowLeft" && dir.x !== 1) dir = { x: -1, y: 0 };
      if (e.key === "ArrowRight" && dir.x !== -1) dir = { x: 1, y: 0 };
    };
    window.addEventListener("keydown", onKey);
    placeFood(); draw();

    return () => { clearInterval(id); window.removeEventListener("keydown", onKey); };
  }, []);

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="text-3xl font-bold mb-2">Jeu : Snake</h1>
      <p className="mb-4 text-white/80">Score : {score}</p>
      <canvas ref={canvasRef} width={600} height={400} className="rounded-lg border border-white/20 bg-black" />
    </main>
  );
}
