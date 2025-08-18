// app/components/Modal.tsx

"use client";
export default function Modal({
  open, title, children, onClose, onPrimary, primaryLabel="OK", secondaryLabel="Annuler"
}:{
  open:boolean; title:string; children:React.ReactNode;
  onClose:()=>void; onPrimary?:()=>void; primaryLabel?:string; secondaryLabel?:string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-white/20 bg-neutral-900 p-4 text-white shadow-xl" onClick={e=>e.stopPropagation()}>
        <div className="mb-2 text-lg font-semibold">{title}</div>
        <div className="mb-4 text-sm text-white/90">{children}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded border border-white/30 px-3 py-2 hover:bg-white/10">{secondaryLabel}</button>
          {onPrimary && <button onClick={onPrimary} className="rounded bg-white px-3 py-2 text-black hover:bg-white/90">{primaryLabel}</button>}
        </div>
      </div>
    </div>
  );
}
