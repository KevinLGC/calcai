import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CalcAI - Your Smart Calculator",
  description: "A modern calculator with AI capabilities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
          {children}
        </main>
      </body>
    </html>
  );
}
