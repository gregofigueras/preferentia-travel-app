import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Navigation } from "@/components/Navigation";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Preferentia Travel | Operaciones y Liquidaciones Lautaro",
  description: "Sistema integral de gestión de viajes, liquidaciones, seguimiento de cobros y comisiones de Preferentia Travel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white`}
      >
        <AppProvider>
          <Navigation />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-400">
            <p>Preferentia Travel · Sistema Operativo de Liquidaciones & CRM · Lautaro Zeppa</p>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
