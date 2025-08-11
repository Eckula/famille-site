// app/layout.js
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import ThemeToggle from "./components/ThemeToggle";

export const metadata = {
  title: "Famille — Accueil",
  description: "Site familial moderne : photos, vidéos, événements.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="min-h-screen text-slate-800 dark:text-slate-100">
        <ThemeProvider>
          {/* Vidéo de fond plein écran */}
          <video
            className="bg-video fixed inset-0 -z-10 h-full w-full object-cover"
            src="/videos/video2.mp4"        // ← ta vidéo dans public/videos/video2.mp4
            poster="/videos/poster.jpg"     // ← image de couverture optionnelle
            autoPlay
            muted
            loop
            playsInline
          />
          
          {/* Overlay global pour lisibilité */}
          <div className="fixed inset-0 -z-10 bg-black/40"></div>

          {/* Bouton de bascule thème clair/sombre */}
          <div className="fixed right-4 top-4 z-50">
            <ThemeToggle />
          </div>

          {/* Contenu de la page */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
