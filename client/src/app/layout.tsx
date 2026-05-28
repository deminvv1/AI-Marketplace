import type { Metadata, Viewport } from "next";
import { Providers } from "./providers"; // Сейчас создадим этот файл для React Query
import "@/styles.css"; // Прямой импорт твоих глобальных стилей

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "AI Marketplace — Connect with AI specialists worldwide",
  description: "The first international platform uniting AI specialists and clients from around the world.",
  authors: [{ name: "Lovable" }],
  openGraph: {
    title: "AI Marketplace",
    description: "Connect with AI specialists and clients worldwide.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Lovable",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}