'use client'

import { WalletConnect } from "./WalletConnect";
import { Shield } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";

export function MarketingNavbar() {
  const { isConnected } = useAccount();

  return (
    <nav className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Shield className="w-6 h-6" />
          </div>
          Zyn Protocol
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          <Link href="/#features" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/pay" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            Send Payment
          </Link>
          <Link href="/dashboard" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <Button className="font-bold rounded-xl px-6" asChild>
              <Link href="/dashboard">Launch App</Link>
            </Button>
          ) : (
            <WalletConnect />
          )}
        </div>
      </div>
    </nav>
  );
}
