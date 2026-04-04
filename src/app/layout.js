import "@/app/globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

export const metadata = {
  title: "Chord Tempo",
  description: "Precision Metronome & Interactive Chord Charts",
};

export default function RootLayout({ children }) {
  return (
    // "dark" di sini memastikan tema Deep Night kita aktif
    <html lang="id" className="dark"> 
      <body className="font-sans antialiased bg-background text-foreground">
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