'use client'

import { WalletConnect } from "@/components/WalletConnect";
import { Shield } from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Shield className="w-5 h-5" />
            </div>
            Zyn Protocol
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-6 mr-6">
              <Link href="/pay" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                Send
              </Link>
              <Link href="/dashboard" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            </div>
            <WalletConnect />
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
      <footer className="w-full py-12 border-t bg-card/30">
        <div className="container mx-auto px-6 text-center space-y-4">
          <div className="text-sm font-medium text-muted-foreground/50">
            © 2026 Zyn Protocol. Built with 🛡️ on Sepolia.
          </div>
        </div>
      </footer>
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
