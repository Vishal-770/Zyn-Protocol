'use client'

import { Sidebar } from "@/components/Sidebar";
import { WalletConnect } from "@/components/WalletConnect";
import { useAccount } from "wagmi";
import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, isConnecting } = useAccount();

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
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-border/40 bg-background/50 backdrop-blur-xl flex items-center justify-end px-8 shrink-0 z-30">
          <WalletConnect />
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="max-w-5xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
