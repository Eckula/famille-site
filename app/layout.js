// app/layout.js
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import Nav from "./components/Nav";
import WeatherWidget from "./components/WeatherWidget";
// 👇 NEW: pilule flottante + feux d’artifice/fleurs
import EventPillGlobal from "./components/EventPillGlobal";

export const metadata = {
  title: "Famille Merenge — Accueil",
  description: "Site familial: photos, vidéos, événements et souvenirs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen text-slate-800 dark:text-slate-100">
        <ThemeProvider>
          {/* Vidéo de fond */}
          <video
            className="fixed inset-0 -z-10 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/videos/video2_vp9.webm" type="video/webm" />
            <source src="/videos/video2_h264.mp4" type="video/mp4" />
            <source src="/videos/video2.mp4" type="video/mp4" />
          </video>

          {/* Overlay pour lisibilité */}
          <div className="fixed inset-0 -z-10 bg-black/40" />

          {/* 👉 Le SEUL widget météo (il se place en haut-droite) */}
          <WeatherWidget />

          {/* Barre de navigation */}
          <Nav />
          <div className="h-16 md:h-20" />

          {children}

          {/* 👇 NEW: pilule globale visible partout + overlay plein écran le jour J */}
          <EventPillGlobal />
        </ThemeProvider>
      </body>
    </html>
  );
}
