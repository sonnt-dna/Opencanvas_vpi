import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { FileContentProvider } from '@/contexts/FileContentContext';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Canvas",
  description: "Open Canvas Chat UX by LangChain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FileContentProvider>
          {children}
        </FileContentProvider>
      </body>
    </html>
  );
}
