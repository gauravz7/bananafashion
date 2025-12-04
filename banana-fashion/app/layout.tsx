import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Banana Fashion",
  description: "Create realistic images of your clothes, worn by anyone.",
};

import { AssetProvider } from "@/context/AssetContext";
import { AuthProvider } from "@/context/AuthContext";
import { SkinProvider } from "@/context/SkinContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-foreground overflow-hidden`}>
        <SkinProvider>
          <AuthProvider>
            <AssetProvider>
              <div className="flex h-screen w-full">
                <Sidebar />
                <div className="flex-1 flex flex-col ml-64">
                  <Header />
                  <main className="flex-1 overflow-y-auto pt-16 p-6">
                    {children}
                  </main>
                </div>
              </div>
            </AssetProvider>
          </AuthProvider>
        </SkinProvider>
      </body>
    </html>
  );
}
