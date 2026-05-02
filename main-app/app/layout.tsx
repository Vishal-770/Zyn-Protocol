import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from "./providers";
import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";
import { Toaster } from "@/components/ui/sonner";
import { Shield } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zyn Protocol",
  description: "Privacy-first Web3 identity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col`}>
        <Providers>
          <nav className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                    <Shield className="w-5 h-5" />
                  </div>
                  Zyn Protocol
                </Link>
                <div className="hidden md:flex gap-6">
                  <Link href="/pay" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                    Send
                  </Link>
                  <Link href="/dashboard" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <WalletConnect />
              </div>
            </div>
          </nav>
          <main className="flex-1">
            {children}
          </main>
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
