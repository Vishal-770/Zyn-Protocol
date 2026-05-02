'use client'

import { Sidebar } from "@/components/Sidebar";
import { WalletConnect } from "@/components/WalletConnect";
import { useAccount } from "wagmi";
import { useState } from "react";
import { Loader2, ShieldAlert, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, isConnecting } = useAccount();
  const [collapsed, setCollapsed] = useState(false);

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 font-bold text-muted-foreground animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center space-y-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-4">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Access Restricted</h1>
          <p className="text-muted-foreground max-w-sm">
            You must connect your wallet to access the Zyn Protocol dashboard and secure features.
          </p>
        </div>
        <div className="flex gap-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Controlled by Layout State */}
      <Sidebar collapsed={collapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Horizontal Navbar */}
        <header className="h-20 border-b border-border/40 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
            <div className="h-4 w-[1px] bg-border/40 mx-2 hidden sm:block" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 hidden sm:block">
              Zyn Terminal
            </span>
          </div>
          
          <WalletConnect />
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="max-w-5xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
