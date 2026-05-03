'use client'

import { WalletConnect } from "./WalletConnect";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";

export function MarketingNavbar() {
  const { isConnected } = useAccount();

  return (
    <nav className="bg-transparent absolute top-0 left-0 w-full z-[60]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-6 group">
          <div className="relative w-10 h-10 overflow-hidden brightness-110">
            <Image 
              src="/logo.png" 
              alt="Zyn Logo" 
              fill 
              className="object-contain group-hover:scale-110 transition-transform duration-700 invert" 
            />
          </div>
          <span className="text-xl font-black uppercase italic tracking-tighter leading-none pt-1">Zyn Protocol</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-12">
          {[
            { name: "Features", href: "/#features" },
            { name: "Dashboard", href: "/dashboard" },
            { name: "Docs", href: "/docs" }
          ].map((item) => (
            <Link 
              key={item.name}
              href={item.href} 
              className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 hover:text-primary transition-all relative group py-2"
            >
              {item.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-6">
          {isConnected ? (
            <Button className="font-black uppercase tracking-[0.4em] text-[10px] rounded-none px-12 h-12 shadow-2xl shadow-primary/20 bg-foreground text-background hover:bg-primary transition-all" asChild>
              <Link href="/dashboard">Go to App</Link>
            </Button>
          ) : (
            <div className="scale-90 origin-right saturate-0 hover:saturate-100 transition-all">
              <WalletConnect />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
