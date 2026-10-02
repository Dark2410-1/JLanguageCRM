import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoJp = Noto_Sans_JP({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sensei AI - Japanese Learning Platform",
  description: "Ultra-fast Japanese Learning and CRM Platform",
};

import { getSession } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  // Agar session yo'q bo'lsa (Login / Register sahifasi) Sidebar va Header ni yashiramiz
  if (!session) {
    return (
      <html lang="uz" className="dark">
        <body className={`${inter.variable} ${notoJp.variable} font-sans antialiased bg-obsidian-900 text-slate-100 selection:bg-violet-500/30 selection:text-violet-500`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="uz" className="dark">
      <body className={`${inter.variable} ${notoJp.variable} font-sans antialiased bg-obsidian-900 text-slate-100 selection:bg-violet-500/30 selection:text-violet-500 flex h-screen overflow-hidden`}>
        {/* Sidebar */}
        <Sidebar session={session} />
        
        {/* Main Content Wrapper */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top Header */}
          <Header session={session} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
