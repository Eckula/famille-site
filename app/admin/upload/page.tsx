"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

console.log("Cloudinary Config en prod :", {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  apiSecret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET ? "OK (masqué)" : "Non défini"
});


const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

type Status = "idle" | "uploading" | "done" | "error";
const MAX_SIZE = 50 * 1024 * 1024; // 50 Mo par fichier (ajuste si tu veux)

const RUBRICS = [
  { key: "Photos", label: "Photos" },
  { key: "Vidéos", label: "Vidéos" },
  { key: "Documents", label: "Documents" }, // PDF, Word, etc.
  { key: "Audio", label: "Audio" },         // mp3, wav…
  { key: "Autres", label: "Autres" },
];

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState<number[]>([]);
  const [msg, setMsg] = useState("");
  const [rubric, setRubric] = useState<string>("Photos");
  const [subFolder, setSubFolder] = useState<string>(""); // ex: Anniversaires/Paul-2025

  useEffect(() => {
    if (!CLOUD || !PRESET) {
      setMsg("⚠️ Vérifie NEXT_PUBLIC_CLOUDINARY_* dans .env.local");
    }
  }, []);

  function validate(f: File) {
    if (f.size > MAX_SIZE) {
      setMsg(`Fichier trop volumineux: ${f.name} (max 50 Mo)`);
      return false;
    }
    return true;
  }

  function pick(list: FileList) {
    const arr = Array.from(list).filter(validate);
    setMsg("");
    setFiles(arr);
    setPreviews(arr.map((f) => (f.type.startsWith("image/") || f.type.startsWith("video/") ? URL.createObjectURL(f) : "")));
    setProgress(new Array(arr.length).fill(0));
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) pick(e.target.files);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files) pick(e.dataTransfer.files);
  }
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }

  function reset() {
    setFiles([]); setPreviews([]); setProgress([]); setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  function buildFolder() {
    // On range sous famille/<Rubrique>/<Sous-dossier facultatif>
    const base = "famille";
    const parts = [base, rubric];
    if (subFolder.trim()) parts.push(subFolder.trim());
    return parts.join("/");
  }

  async function uploadParallel() {
    if (files.length === 0) {
      setMsg("Sélectionne au moins un fichier.");
      return;
    }
    setStatus("uploading"); setMsg("");

    const folder = buildFolder();

    // Lance tous les uploads en même temps (un XHR par fichier pour avoir les progress individuels)
    await Promise.allSettled(
      files.map((file, i) => {
        return new Promise<void>((resolve, reject) => {
          const form = new FormData();
          form.append("file", file);
          form.append("upload_preset", PRESET);
          form.append("folder", folder); // Cloudinary rangera dans ce sous-dossier

          const xhr = new XMLHttpRequest();
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`);
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              setProgress((prev) => {
                const copy = [...prev];
                copy[i] = Math.round((ev.loaded / ev.total) * 100);
                return copy;
              });
            }
          };
          xhr.onload = () => {
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.secure_url) resolve();
              else reject(new Error("Upload échoué"));
            } catch { reject(new Error("Réponse invalide")); }
          };
          xhr.onerror = () => reject(new Error("Erreur réseau"));
          xhr.send(form);
        });
      })
    );

    setStatus("done");
    setMsg("✅ Upload terminé !");
    setTimeout(() => router.push("/galerie"), 900);
  }

  return (
    <main className="px-6 py-20 text-white">
      <h1 className="text-3xl font-bold mb-4">Uploader des médias</h1>
      <p className="mb-6">Sélectionne plusieurs fichiers (images, vidéos, PDF, Word, audio, etc.). Ils seront rangés selon la rubrique choisie.</p>

      {/* Choix de la rubrique + sous-dossier */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 max-w-xl">
        <select
          value={rubric}
          onChange={(e) => setRubric(e.target.value)}
          className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
        >
          {RUBRICS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
        </select>
        <input
          value={subFolder}
          onChange={(e) => setSubFolder(e.target.value)}
          placeholder="Sous-dossier (ex: Anniversaires/Paul-2025)"
          className="flex-1 rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
        />
      </div>

      {/* Zone drag & drop + bouton choisir */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="max-w-xl border-2 border-dashed border-white/30 rounded-xl p-6 bg-black/40"
      >
        <input
          ref={inputRef}
          id="file-input"
          type="file"
          // on autorise pratiquement tout ; Cloudinary détectera (image, video, raw)
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          multiple
          className="hidden"
          onChange={onInputChange}
        />
        <div className="text-center space-y-3">
          <p className="text-white/80">Glisse les fichiers ici</p>
          <label
            htmlFor="file-input"
            className="inline-block cursor-pointer rounded-lg border border-white/20 bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            Choisir des fichiers
          </label>
          <p className="text-xs text-white/60">Max 50 Mo par fichier</p>
          <p className="text-xs text-white/60">Dossier final : <code>{buildFolder()}</code></p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {files.map((f, idx) => (
              <div key={idx}>
                {previews[idx] ? (
                  f.type.startsWith("image/") ? (
                    <img src={previews[idx]} alt={f.name} className="max-h-40 w-full object-cover rounded-lg" />
                  ) : f.type.startsWith("video/") ? (
                    <video src={previews[idx]} className="max-h-40 w-full object-cover rounded-lg" controls />
                  ) : null
                ) : (
                  <div className="h-40 w-full grid place-items-center rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                    {f.name}
                  </div>
                )}
                <div className="mt-1 text-xs truncate">{f.name}</div>
                {status === "uploading" && (
                  <div className="h-2 bg-white/10 rounded mt-1">
                    <div className="h-2 bg-yellow-500 rounded" style={{ width: `${progress[idx] ?? 0}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={uploadParallel}
          disabled={files.length === 0 || status === "uploading"}
          className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 disabled:opacity-50"
        >
          {status === "uploading" ? "Envoi…" : "Envoyer"}
        </button>
        <button
          onClick={reset}
          disabled={files.length === 0 || status === "uploading"}
          className="px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 disabled:opacity-50"
        >
          Réinitialiser
        </button>
        <button
          onClick={() => router.push("/galerie")}
          className="px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10"
        >
          Retour à la galerie
        </button>
      </div>

      {msg && <p className="mt-4">{msg}</p>}
    </main>
  );
}
