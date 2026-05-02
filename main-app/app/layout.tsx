import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from "./providers";
import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StealthPay",
  description: "Your private Web3 identity",
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
          <nav className="border-b bg-card">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-xl font-bold tracking-tight">
                  Stealth<span className="text-primary">Pay</span>
                </Link>
                <div className="hidden md:flex gap-4">
                  <Link href="/pay" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Pay
                  </Link>
                  <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
        </Providers>
      </body>
    </html>
  );
}
