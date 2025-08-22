// app/galerie/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GalleryFolders from "../components/GalleryFolders";

/* ---------- Types ---------- */

type Kind = "image" | "video" | "audio" | "document";
type Item = {
  id: string;
  public_id: string;
  kind: Kind;
  title: string;
  url: string;
  thumb?: string;
  createdAt: string;
  format?: string;
  folder?: string;
  resource_type?: "image" | "video" | "raw";
};
type Tab = "all" | "images" | "videos" | "audio" | "documents";

/* ---------- Helpers ---------- */

const isYouTube = (url: string) => /youtu\.be|youtube\.com/.test(url);

function getTabFromUrl(): Tab {
  if (typeof window === "undefined") return "all";
  const t = (new URLSearchParams(window.location.search).get("tab") || "all").toLowerCase();
  const allowed: Tab[] = ["all", "images", "videos", "audio", "documents"];
  return (allowed as readonly string[]).includes(t) ? (t as Tab) : "all";
}

const officeExts = ["doc", "docx", "ppt", "pptx", "xls", "xlsx"];
const imageExts = ["jpg","jpeg","png","gif","webp","heic","heif","avif","bmp","tiff","svg"];
const videoExts = ["mp4","mov","webm","mkv","avi","m4v"];
const audioExts = ["mp3","wav","m4a","aac","ogg","oga","flac"];

function docEmoji(ext?: string) {
  const e = (ext || "").toLowerCase();
  if (e === "pdf") return "📄";
  if (["doc", "docx"].includes(e)) return "📝";
  if (["xls", "xlsx", "csv"].includes(e)) return "📊";
  if (["ppt", "pptx"].includes(e)) return "📽️";
  if (audioExts.includes(e)) return "🎵";
  if (["zip", "rar", "7z", "tar", "gz"].includes(e)) return "🗜️";
  return "📎";
}
const sanitizeName = (name: string) => name.replace(/[^\w.\-\sÀ-ÖØ-öø-ÿ]/g, "_");

function apiFile(publicId: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const u = new URL("/api/media/file", origin);
  u.searchParams.set("public_id", publicId);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, String(v));
  });
  return u.toString();
}

function openUrl(it: Item, overrideExt?: string) {
  const ext = (overrideExt || it.format || "").toLowerCase();
  const baseName = it.title?.trim() || it.public_id.split("/").pop() || "document";
  const nice = sanitizeName(ext && !baseName.endsWith("." + ext) ? `${baseName}.${ext}` : baseName);
  return apiFile(it.public_id, { format: ext || "", dl: 0, filename: nice });
}
function downloadUrl(it: Item, overrideExt?: string) {
  const ext = (overrideExt || it.format || "").toLowerCase();
  const baseName = it.title?.trim() || it.public_id.split("/").pop() || "document";
  const nice = sanitizeName(ext && !baseName.endsWith("." + ext) ? `${baseName}.${ext}` : baseName);
  return apiFile(it.public_id, { format: ext || "", dl: 1, filename: nice });
}
function folderOf(it: Item) {
  return (it.folder && it.folder.length > 0
    ? it.folder.replace(/\/+$/, "")
    : it.public_id.split("/").slice(0, -1).join("/").replace(/\/+$/, ""))!;
}
const normFolder = (s: string) => s.trim().replace(/^\/+|\/+$/g, "").replace(/\/{2,}/g, "/");

/* ---------- Page ---------- */

export default function GaleriePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const spGet = useCallback((k: string, fallback = "") => searchParams?.get(k) ?? fallback, [searchParams]);

  const [raw, setRaw] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  // Sélection multiple
  const [selectedPublicIds, setSelectedPublicIds] = useState<Set<string>>(new Set());
  const toggleSel = (publicId: string) =>
    setSelectedPublicIds((s) => (s.has(publicId) ? new Set([...s].filter((x) => x !== publicId)) : new Set(s).add(publicId)));
  const clearSel = () => setSelectedPublicIds(new Set());

  // Déplacement Cloudinary (physique)
  const [moveFolder, setMoveFolder] = useState("famille/Photos");

  // Dossiers BD (affectation)
  type Folder = { id: string; name: string; parentId: string | null; createdAt: string };
  const [folders, setFolders] = useState<Folder[]>([]);
  const [assignFolderId, setAssignFolderId] = useState<string>("");

  // Mapping publicId -> (folderId, name) pour badges
  const [assignedMap, setAssignedMap] = useState<Record<string, { folderId: string; name: string }>>({});

  // Lightbox
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const swipeStartX = useRef<number | null>(null);

  // busy states
  const [busyDel, setBusyDel] = useState(false);
  const [busyMove, setBusyMove] = useState(false);
  const [busyAssign, setBusyAssign] = useState(false);

  // Détection device tactile (pour appui long)
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    try {
      setIsTouchDevice(
        typeof window !== "undefined" &&
          ("ontouchstart" in window || (navigator as any).maxTouchPoints > 0)
      );
    } catch {
      setIsTouchDevice(false);
    }
  }, []);

  // Refs utilitaires pour l’appui long (partagés)
  const lpTimer = useRef<number | null>(null);
  const lpFired = useRef(false);
  const lpStartXY = useRef<{ x: number; y: number } | null>(null);
  const ignoreClicksUntil = useRef(0);
  const LP_THRESHOLD_MS = 450;
  const LP_CANCEL_DIST = 10;

  /* ---------- Chargements ---------- */

  const fetchList = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const v = (spGet("view", "unassigned")).toLowerCase();
      const folderId = spGet("folderId", "");
      const currentTab = getTabFromUrl();

      const qs = new URLSearchParams();
      if (v) qs.set("view", v);
      if (folderId) qs.set("folderId", folderId);
      if (currentTab) qs.set("tab", currentTab);
      qs.set("perPage", "500");
      qs.set("ts", Date.now().toString());

      const r = await fetch(`/api/media/list?${qs.toString()}`, { cache: "no-store" });
      if (!r.ok) {
        setRaw([]);
        setErrorMsg(`/api/media/list a répondu ${r.status}`);
        return;
      }
      const j = await r.json();

      const src: any[] = Array.isArray(j?.items) ? j.items : Array.isArray(j?.resources) ? j.resources : Array.isArray(j) ? j : [];

      const list: Item[] = src.map((x: any) => {
        const public_id: string = x.public_id || x?.asset_id || "";
        const title = x.title || x.original_filename || (public_id ? public_id.split("/").pop() : "") || "";
        const primaryUrl: string = x.url || x.secure_url || x.path || "";
        const fmt = (x.format || "") || (primaryUrl.includes(".") ? primaryUrl.split(".").pop()?.toLowerCase() : "");
        const rt  = (x.resource_type || "").toLowerCase();
        const ext = String(fmt || "").toLowerCase();
        const isImg   = rt === "image" || imageExts.includes(ext);
        const isAudio = audioExts.includes(ext);
        const isVid   = (!isAudio && (rt === "video" || videoExts.includes(ext)));
        const kind: Kind = isImg ? "image" : isAudio ? "audio" : isVid ? "video" : "document";
        const createdAt = x.createdAt || x.created_at || x.uploaded_at || new Date().toISOString();

        return {
          id: x.id || x.asset_id || public_id || (globalThis.crypto?.randomUUID?.() ?? `${public_id}-${Math.random().toString(36).slice(2)}`),
          public_id,
          kind,
          title,
          url: primaryUrl,
          thumb: x.thumb || x.thumbnail_url || x.secure_url || primaryUrl,
          createdAt,
          format: ext || undefined,
          folder: x.folder || (public_id ? public_id.split("/").slice(0, -1).join("/") : ""),
          resource_type: (x.resource_type || "").toLowerCase(),
        } as Item;
      });

      setRaw(list);
      if (!list.length) {
        const errTxt = j?.error || j?.message || "";
        if (errTxt) setErrorMsg(String(errTxt));
      }
    } catch (e: any) {
      setRaw([]);
      setErrorMsg(e?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [spGet]);

  const fetchFolders = useCallback(async () => {
    try {
      const r = await fetch("/api/folders", { cache: "no-store" });
    const j = await r.json();
      if (r.ok && Array.isArray(j?.items)) setFolders(j.items);
      else setFolders([]);
    } catch {
      setFolders([]);
    }
  }, []);

  const fetchAssignedMap = useCallback(async () => {
    try {
      const r = await fetch("/api/folders/map", { cache: "no-store" });
      const j = await r.json();
      if (r.ok && j?.byPublicId) setAssignedMap(j.byPublicId);
      else setAssignedMap({});
    } catch {
      setAssignedMap({});
    }
  }, []);

  useEffect(() => {
    setTab(getTabFromUrl());
    fetchList();
    fetchFolders();
    fetchAssignedMap();
  }, [fetchList, fetchFolders, fetchAssignedMap, searchParams]);

  /* ---------- Filtres / Tri ---------- */

  const items = useMemo(() => {
    let data = [...raw];
    if (tab === "images") data = data.filter((x) => x.kind === "image");
    if (tab === "videos") data = data.filter((x) => x.kind === "video");
    if (tab === "audio") data = data.filter((x) => x.kind === "audio");
    if (tab === "documents") data = data.filter((x) => x.kind === "document");
    const q = query.trim().toLowerCase();
    if (q) data = data.filter((x) => (x.title || "").toLowerCase().includes(q));
    data.sort((a, b) => (sort === "newest" ? +new Date(b.createdAt) - +new Date(a.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt)));
    return data;
  }, [raw, tab, query, sort]);

  const viewable = items;

  /* ---------- Actions API médias ---------- */

  async function doDelete() {
    if (selectedPublicIds.size === 0) return;
    if (!confirm(`Supprimer ${selectedPublicIds.size} élément(s) ?`)) return;

    setBusyDel(true);
    try {
      const payload = { publicIds: Array.from(selectedPublicIds) };
      const res = await fetch("/api/media/delete", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`);

      clearSel();
      await fetchList();
      await fetchAssignedMap();
    } catch (e: any) {
      alert(e?.message || "Erreur suppression.");
    } finally {
      setBusyDel(false);
    }
  }

  async function doMoveCloudinary() {
    if (selectedPublicIds.size === 0) return;

    const targetRaw = moveFolder.trim().replace(/\/+$/, "");
    const target = normFolder(targetRaw);
    if (!target) { alert("Renseigne un dossier Cloudinary cible (ex: famille/Photos/2025)"); return; }

    const selectedItems = items.filter(i => selectedPublicIds.has(i.public_id));
    if (!selectedItems.length) return;

    const sameAsTarget = selectedItems.filter(it => normFolder(folderOf(it)) === target);
    if (sameAsTarget.length === selectedItems.length) {
      alert(`Les ${selectedItems.length} élément(s) sélectionné(s) sont déjà dans « ${target} ».\nAucun déplacement effectué.`);
      return;
    }
    if (sameAsTarget.length > 0) {
      const proceed = confirm(
        `${sameAsTarget.length} élément(s) sont déjà dans « ${target} » et seront ignorés.\n` +
        `Continuer pour déplacer les ${selectedItems.length - sameAsTarget.length} autre(s) ?`
      );
      if (!proceed) return;
    }

    const toMove = selectedItems
      .filter(it => normFolder(folderOf(it)) !== target)
      .map(it => it.public_id);

    if (toMove.length === 0) {
      alert("Rien à déplacer.");
      return;
    }

    setBusyMove(true);
    try {
      const payload = { publicIds: toMove, toFolder: target };
      const res = await fetch("/api/media/move", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`);

      clearSel();
      await fetchList();
      alert(`Déplacement terminé : ${toMove.length} élément(s).`);
    } catch (e: any) {
      alert(e?.message || "Erreur déplacement Cloudinary.");
    } finally {
      setBusyMove(false);
    }
  }

  async function doAssignFolder() {
    if (selectedPublicIds.size === 0) return;
    if (!assignFolderId) { alert("Sélectionne un dossier."); return; }

    setBusyAssign(true);
    try {
      const payload = { folderId: assignFolderId, public_ids: Array.from(selectedPublicIds) };
      const res = await fetch("/api/folders/assign", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.error) throw new Error(j?.error || `HTTP ${res.status}`);

      clearSel();
      await fetchFolders();
      await fetchAssignedMap();

      const go = `/galerie?view=folder&folderId=${encodeURIComponent(assignFolderId)}&tab=all&perPage=500&ts=${Date.now()}`;
      if (confirm(`Affectés (${j.count}). Ouvrir le dossier dans la Galerie ?`)) {
        router.push(go);
      } else {
        await fetchList();
      }
    } catch (e: any) {
      alert(e?.message || "Erreur d'affectation.");
    } finally {
      setBusyAssign(false);
    }
  }

  async function doUnassignFolder() {
    if (selectedPublicIds.size === 0) return;
    setBusyAssign(true);
    try {
      const payload = { folderId: null, public_ids: Array.from(selectedPublicIds) };
      const res = await fetch("/api/folders/assign", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || j?.error) throw new Error(j?.error || `HTTP ${res.status}`);

      clearSel();
      await fetchFolders();
      await fetchAssignedMap();
      await fetchList();
      alert(`Retirés (${j.count})`);
    } catch (e: any) {
      alert(e?.message || "Erreur de retrait.");
    } finally {
      setBusyAssign(false);
    }
  }

  /* ---------- Téléchargements ---------- */

  function openMany(list: Item[], dl: boolean) {
    list.forEach((it, idx) => {
      const u = dl ? downloadUrl(it) : openUrl(it);
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = u; a.target = "_blank"; a.rel = "noopener";
        document.body.appendChild(a); a.click(); a.remove();
      }, idx * 150);
    });
  }
  const downloadSelected = () => selectedPublicIds.size && openMany(items.filter(i => selectedPublicIds.has(i.public_id)), true);
  const downloadVisible  = () => items.length && openMany(items, true);

  /* ---------- Sélection globale ---------- */

  const allVisibleSelected = useMemo(
    () => items.length > 0 && items.every((i) => selectedPublicIds.has(i.public_id)),
    [items, selectedPublicIds]
  );
  const toggleSelectAllVisible = () => {
    setSelectedPublicIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) items.forEach((i) => next.delete(i.public_id));
      else items.forEach((i) => next.add(i.public_id));
      return next;
    });
  };

  /* ---------- Lightbox ---------- */

  const openLightboxFor = (id: string) => {
    const idx = viewable.findIndex((x) => x.id === id);
    if (idx >= 0) { setLbIndex(idx); setLbOpen(true); }
  };
  useEffect(() => {
    if (!lbOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLbOpen(false);
      if (e.key === "ArrowLeft")  setLbIndex((i) => (i - 1 + viewable.length) % viewable.length);
      if (e.key === "ArrowRight") setLbIndex((i) => (i + 1) % viewable.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lbOpen, viewable.length]);
  const onTouchStart = (e: React.TouchEvent) => { swipeStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) setLbIndex((i) => (i - 1 + viewable.length) % viewable.length);
    else       setLbIndex((i) => (i + 1) % viewable.length);
  };

  /* ---------- Handlers d’appui long (mobile) ---------- */
  const handleTouchStartItem = (publicId: string) => (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    lpFired.current = false;
    const t = e.touches[0];
    lpStartXY.current = { x: t.clientX, y: t.clientY };
    if (lpTimer.current) clearTimeout(lpTimer.current);
    lpTimer.current = window.setTimeout(() => {
      lpFired.current = true;
      ignoreClicksUntil.current = Date.now() + 800;
      toggleSel(publicId);
      try { (navigator as any)?.vibrate?.(10); } catch {}
    }, LP_THRESHOLD_MS);
  };
  const handleTouchMoveItem = () => (e: React.TouchEvent) => {
    if (!isTouchDevice || !lpStartXY.current) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - lpStartXY.current.x);
    const dy = Math.abs(t.clientY - lpStartXY.current.y);
    if (dx > LP_CANCEL_DIST || dy > LP_CANCEL_DIST) {
      if (lpTimer.current) { clearTimeout(lpTimer.current); lpTimer.current = null; }
    }
  };
  const handleTouchEndItem = () => () => {
    if (!isTouchDevice) return;
    if (lpTimer.current) { clearTimeout(lpTimer.current); lpTimer.current = null; }
  };
  const handleClickItem = (id: string) => () => {
    if (isTouchDevice && Date.now() < ignoreClicksUntil.current) return; // ignore clic après appui long
    openLightboxFor(id);
  };

  /* ---------- Rendu ---------- */

  return (
    <main className="px-6 py-24 text-white">
      <h1 className="mb-2 text-3xl font-bold">Galerie</h1>
      <p className="mb-2 text-white/80">
        Photos, vidéos et documents du dossier Cloudinary <code>famille</code>.
      </p>

      {/* Dossiers (barre + création) */}
      <GalleryFolders />

      {/* Filtres haut */}
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex gap-2 rounded-full border border-white/20 bg-black/30 p-1">
          {(["all", "images", "videos", "audio", "documents"] as const).map((k) => (
            <Link
              key={k}
              prefetch={false}
              href={`/galerie?tab=${k}&view=${spGet("view","unassigned")}${spGet("folderId","") ? `&folderId=${spGet("folderId","")}` : ""}`}
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-2 ${tab === k ? "bg-white/20" : "hover:bg-white/10"}`}
            >
              {k === "all" ? "Tout" : k === "images" ? "Photos" : k === "videos" ? "Vidéos" : k === "audio" ? "Audio" : "Documents"}
            </Link>
          ))}
        </div>

        {/* Recherche + tri + actions globales */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par titre…"
            className="w-full rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-300/60 sm:w-72"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
          >
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
          </select>
          <button onClick={fetchList} disabled={loading} className="rounded-lg border border-white/20 bg-black/30 px-3 py-2">
            {loading ? "Chargement…" : "Rafraîchir"}
          </button>
          <button
            onClick={toggleSelectAllVisible}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
            title="Sélectionner ou désélectionner tous les éléments visibles"
          >
            {allVisibleSelected ? "Tout désélectionner (vue)" : "Tout sélectionner (vue)"}
          </button>
          <button
            onClick={downloadVisible}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
            title="Télécharger tous les éléments visibles"
          >
            Télécharger (vue)
          </button>
          <Link
            href={`/admin/upload?rubric=${
              tab === "images" ? "Photos" : tab === "videos" ? "Vidéos" : tab === "audio" ? "Audio" : tab === "documents" ? "Documents" : "Photos"
            }`}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-center hover:bg-white/20"
          >
            ➕ Ajouter des médias
          </Link>
        </div>
      </div>

      {/* Barre d'actions sélection */}
      {selectedPublicIds.size > 0 && (
        <div className="mt-3 mb-4 rounded-xl border border-white/20 bg-black/80 p-3 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="text-sm text-white/90">
              {selectedPublicIds.size} élément{selectedPublicIds.size > 1 ? "s" : ""} sélectionné{selectedPublicIds.size > 1 ? "s" : ""}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={downloadSelected} className="rounded bg-blue-500 px-3 py-2 text-black hover:bg-blue-400">
                Télécharger sélection
              </button>

              <button
                type="button"
                onClick={doDelete}
                disabled={busyDel || selectedPublicIds.size === 0}
                className="rounded bg-red-500 px-3 py-2 text-black hover:bg-red-400 disabled:opacity-60"
              >
                {busyDel ? "Suppression…" : "Supprimer"}
              </button>

              {/* Déplacement Cloudinary (physique) */}
              <input
                value={moveFolder}
                onChange={(e) => setMoveFolder(e.target.value)}
                placeholder="Dossier Cloudinary (ex: famille/Photos/2025)"
                className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
              />
              <button
                onClick={doMoveCloudinary}
                disabled={busyMove || selectedPublicIds.size === 0}
                className="rounded bg-yellow-500 px-3 py-2 text-black hover:bg-yellow-400 disabled:opacity-60"
                title="Déplacer physiquement dans Cloudinary"
              >
                {busyMove ? "Déplacement…" : "Déplacer (Cloudinary)"}
              </button>

              {/* Affectation dossier BD */}
              <select
                value={assignFolderId}
                onChange={(e) => setAssignFolderId(e.target.value)}
                className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 outline-none"
                title="Affecter la sélection à un dossier applicatif"
              >
                <option value="">— Choisir un dossier —</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <button
                onClick={doAssignFolder}
                disabled={busyAssign || !assignFolderId || selectedPublicIds.size === 0}
                className="rounded bg-emerald-400 px-3 py-2 text-black hover:bg-emerald-300 disabled:opacity-50"
              >
                {busyAssign ? "Affectation…" : "Affecter au dossier (BD)"}
              </button>
              <button
                onClick={doUnassignFolder}
                disabled={busyAssign || selectedPublicIds.size === 0}
                className="rounded border border-white/30 px-3 py-2 hover:bg-white/10 disabled:opacity-60"
                title="Retirer la sélection de tout dossier"
              >
                {busyAssign ? "Retrait…" : "Retirer du dossier"}
              </button>

              <button onClick={clearSel} className="rounded border border-white/30 px-3 py-2 hover:bg-white/10">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grille - vignettes plus petites sur desktop */}
      {loading ? (
        <p className="mt-6 text-white/70">Chargement…</p>
      ) : items.length === 0 ? (
        <div className="mt-6 space-y-2 text-white/80">
          {!!errorMsg && <p className="text-red-300">⚠️ {errorMsg}</p>}
          <p>Aucun élément.</p>
          {(spGet("view","unassigned").toLowerCase() === "unassigned") && (
            <Link
              prefetch={false}
              href={`/galerie?tab=${getTabFromUrl()}&view=all${spGet("folderId","") ? `&folderId=${spGet("folderId","")}` : ""}`}
              className="inline-block rounded border border-white/30 bg-white/10 px-3 py-1 hover:bg-white/20"
            >
              Voir tous les médias (dossier Cloudinary)
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
          {items.map((m) => {
            const isImg = m.kind === "image";
            const isVid = m.kind === "video";
            const isAudio = m.kind === "audio";
            const isDoc = m.kind === "document";
            const ext = (m.format || "").toLowerCase();
            const assigned = assignedMap[m.public_id];

            return (
              <div
                key={m.id}
                className="group relative overflow-hidden rounded-lg border border-white/20"
                onTouchStart={handleTouchStartItem(m.public_id)}
                onTouchMove={handleTouchMoveItem()}
                onTouchEnd={handleTouchEndItem()}
                onContextMenu={(e) => e.preventDefault()}
              >
                {/* Badge d'affectation */}
                {assigned && (
                  <Link
                    prefetch={false}
                    href={`/evenements/view?folderId=${assigned.folderId}`}
                    className="absolute left-2 top-2 z-10 rounded bg-emerald-500/90 px-2 py-1 text-xs font-medium text-black hover:bg-emerald-400"
                    title={`Voir le dossier : ${assigned.name}`}
                  >
                    📁 {assigned.name}
                  </Link>
                )}

                {/* Checkbox */}
                <label className="absolute right-2 top-2 z-10 inline-flex items-center gap-2 rounded bg-black/50 px-2 py-1 text-xs">
                  <input type="checkbox" checked={selectedPublicIds.has(m.public_id)} onChange={() => toggleSel(m.public_id)} />
                  Sélection
                </label>

                <div className="aspect-video">
                  {isImg ? (
                    <Image
                      src={m.thumb ?? m.url}
                      alt={m.title}
                      width={800}
                      height={600}
                      className="h-full w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-105"
                      onClick={handleClickItem(m.id)}
                      unoptimized
                    />
                  ) : isVid ? (
                    isYouTube(m.url) ? (
                      <iframe
                        src={m.url.replace("watch?v=", "embed/")}
                        className="h-full w-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={m.url}
                        className="h-full w-full cursor-zoom-in object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        onClick={handleClickItem(m.id)}
                      />
                    )
                  ) : isAudio ? (
                    <button
                      onClick={handleClickItem(m.id)}
                      className="grid h-full w-full place-items-center bg-white/5 text-white/90"
                      title="Écouter"
                    >
                      <div className="text-base sm:text-lg">🎵 {m.title || m.public_id.split("/").pop() || "Audio"}</div>
                    </button>
                  ) : isDoc ? (
                    <button
                      onClick={handleClickItem(m.id)}
                      className="grid h-full w-full place-items-center bg-white/5 text-white/90"
                      title="Ouvrir"
                    >
                      <div className="text-base sm:text-lg">
                        {docEmoji(ext)} {m.title}{ext ? `.${ext}` : ""}
                      </div>
                    </button>
                  ) : null}
                </div>

                {(isDoc || isAudio) && (
                  <div className="absolute left-2 bottom-2 z-10">
                    <a
                      href={downloadUrl(m)}
                      className="rounded bg-white/80 px-2 py-1 text-xs text-black hover:bg-white"
                      title="Télécharger"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Télécharger
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lbOpen && viewable.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLbOpen(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative w-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
              <div className="rounded-full bg-black/60 px-3 py-1 text-sm">{lbIndex + 1} / {viewable.length}</div>
              <a href={downloadUrl(viewable[lbIndex])} target="_blank" rel="noopener noreferrer" className="rounded bg-white/80 px-3 py-1 text-sm text-black hover:bg-white">Télécharger</a>
              <a href={openUrl(viewable[lbIndex])}     target="_blank" rel="noopener noreferrer" className="rounded bg-white/80 px-3 py-1 text-sm text-black hover:bg-white">Ouvrir</a>
            </div>
            <button onClick={() => setLbOpen(false)} className="absolute left-2 top-2 z-10 rounded-full border border-white/30 bg-black/40 px-3 py-1">✕</button>
            <button onClick={() => setLbIndex((i) => (i - 1 + viewable.length) % viewable.length)} className="absolute left-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 grid place-items-center rounded-full bg-black/60 text-2xl hover:bg-black/80">←</button>
            <button onClick={() => setLbIndex((i) => (i + 1) % viewable.length)} className="absolute right-2 top-1/2 z-10 h-12 w-12 -translate-y-1/2 grid place-items-center rounded-full bg-black/60 text-2xl hover:bg-black/80">→</button>

            <div className="overflow-hidden rounded-lg border border-white/20 bg-black/40">
              {(() => {
                const cur = viewable[lbIndex];
                const ext = (cur.format || "").toLowerCase();

                if (cur.kind === "image") return <Image src={cur.url} alt={cur.title} width={1200} height={800} className="w-full max-h-[80vh] object-contain" unoptimized />;
                if (isYouTube(cur.url))   return <iframe src={cur.url.replace("watch?v=", "embed/")} className="h-[80vh] w-full" allow="autoplay; encrypted-media" allowFullScreen />;
                if (cur.kind === "video") return <video src={cur.url} className="w-full max-h-[80vh] object-contain" controls autoPlay playsInline />;
                if (cur.kind === "audio") {
                  const src = openUrl(cur, ext || "mp3");
                  return <div className="grid h-[30vh] w-full place-items-center bg-black"><audio src={src} controls autoPlay className="w-[90%]" /></div>;
                }
                if (ext === "pdf") {
                  const pdfUrl = apiFile(cur.public_id, { format: "pdf", dl: 0, filename: sanitizeName((cur.title || "document") + ".pdf") });
                  return <iframe src={pdfUrl} className="h/[80vh] w-full bg-white" title={cur.title || "PDF"} />;
                }
                if (officeExts.includes(ext)) {
                  const fileUrl = openUrl(cur, ext);
                  const officeEmbed = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
                  return <iframe src={officeEmbed} className="h-[80vh] w-full bg-white" title={cur.title || "Document"} />;
                }
                const genericUrl = openUrl(cur, ext);
                return <iframe src={genericUrl} className="h-[80vh] w-full bg-white" title={cur.title || "Fichier"} />;
              })()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
