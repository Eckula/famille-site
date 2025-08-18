// app/components/Toast.tsx
"use client";
import { useEffect } from "react";

export type ToastState = { type: "success" | "error" | "info"; msg: string } | null;

export default function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const color =
    toast.type === "success" ? "bg-emerald-500" :
    toast.type === "error"   ? "bg-red-500" :
                               "bg-slate-600";
  return (
    <div className="fixed left-1/2 top-4 z-[100] -translate-x-1/2">
      <div className={`rounded-lg px-4 py-2 text-sm text-white shadow-lg ${color}`}>
        {toast.msg}
      </div>
    </div>
  );
}
