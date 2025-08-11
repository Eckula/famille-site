// app/components/ThemeToggle.jsx
"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm 
                  bg-white/80 backdrop-blur hover:bg-white dark:bg-slate-900/70 
                  dark:hover:bg-slate-900 border-slate-200 dark:border-slate-700 ${className}`}
      aria-label="Basculer le thème"
      title="Thème clair/sombre"
    >
      <span aria-hidden>{isDark ? "🌙" : "☀️"}</span>
      <span>{isDark ? "Sombre" : "Clair"}</span>
    </button>
  );
}
