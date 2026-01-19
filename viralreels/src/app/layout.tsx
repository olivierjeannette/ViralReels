import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ViralReels - Transformez vos vidéos YouTube en clips viraux",
  description: "Créez automatiquement des clips viraux optimisés pour TikTok, Instagram Reels et YouTube Shorts grâce à l'IA.",
  keywords: ["viral", "reels", "tiktok", "instagram", "youtube", "clips", "ia", "automatisation"],
  authors: [{ name: "ViralReels" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://viralreels.com",
    title: "ViralReels - Clips viraux automatiques",
    description: "Transformez vos vidéos YouTube en clips viraux avec l'IA",
    siteName: "ViralReels",
  },
  twitter: {
    card: "summary_large_image",
    title: "ViralReels - Clips viraux automatiques",
    description: "Transformez vos vidéos YouTube en clips viraux avec l'IA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
