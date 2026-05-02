'use client'

import { useAccount } from 'wagmi'
import Link from 'next/link'
import { ShieldCheck, EyeOff, Zap, ArrowRight, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="flex flex-col items-center py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-24">
      
      {/* Hero Section */}
      <div className="w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2 border border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Zyn Protocol Active
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
          Privacy is now a <span className="text-primary italic">right</span>,<br />not a luxury.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Zyn allows you to receive payments through mathematically derived stealth addresses. 
          No link between your identity and your balance. Ever.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="font-bold rounded-2xl h-14 px-10 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95" asChild>
            <Link href={isConnected ? "/dashboard" : "#"}>
              {isConnected ? "Go to Dashboard" : "Connect Wallet to Start"} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="font-bold rounded-2xl h-14 px-10 text-lg" asChild>
            <Link href="/pay">Send Private Payment</Link>
          </Button>
        </div>
      </div>

      {/* Trust Pillars */}
      <div className="grid sm:grid-cols-3 gap-12 w-full max-w-5xl pt-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 border-t border-border/30">
        <div className="space-y-4 group">
          <div className="w-14 h-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors duration-500">
            <EyeOff className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl">Zero Linkability</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Every transaction uses a mathematically fresh address. Senders cannot track your wealth or history.</p>
        </div>
        <div className="space-y-4 group">
          <div className="w-14 h-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors duration-500">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl">Client-Side Keys</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Encryption runs in your browser. We never see your private keys. Your identity is stored on the official ENS Registry.</p>
        </div>
        <div className="space-y-4 group">
          <div className="w-14 h-14 rounded-2xl bg-card border border-border/50 flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors duration-500">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-xl">EIP-5564 Standard</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Built on the latest Ethereum stealth standards. High-performance scanning with 1-byte view tags for speed.</p>
        </div>
      </div>
    </div>
  )
}
