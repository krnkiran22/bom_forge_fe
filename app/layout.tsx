import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BOMForge AI | Intelligent mBOM Conversion",
  description: "Next-generation eBOM to mBOM conversion powered by enterprise-grade AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body
        className={`${inter.variable} font-sans bg-[#FBFBFD] text-[#1D1D1F] selection:bg-teal-100 selection:text-teal-900`}
      >
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
