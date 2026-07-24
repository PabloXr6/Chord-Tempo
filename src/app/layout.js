import "@/app/globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import Script from "next/script"; 

export const metadata = {
  title: "Chord Tempo",
  description: "Precision Metronome & Interactive Chord Charts",
};

export default function RootLayout({ children }) {
  // Ambil ID dari environment variable
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="id" className="dark"> 
      <body className="font-sans antialiased bg-background text-foreground">
        
        {/* Script AdSense hanya dimuat jika ID tersedia */}
        {adClientId && (
          <Script
            id="adsbygoogle-init"
            strategy="lazyOnload"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`} 
          />
        )}

        <AuthProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          {/* Komponen notifikasi global (Toaster dari Sonner) */}
          <Toaster position="top-center" richColors theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}