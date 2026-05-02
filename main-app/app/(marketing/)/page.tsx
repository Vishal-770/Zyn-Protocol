'use client'

import { useAccount } from 'wagmi'
import Link from 'next/link'
import { ShieldCheck, EyeOff, Zap, ArrowRight, Shield, Lock, Globe, Ghost, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { isConnected } = useAccount()

  return (
    <div className="flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2 border border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Zyn Protocol Active
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
          The Future of <span className="text-primary italic text-glow">Private</span><br />Ethereum Identity.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Zyn allows you to receive payments through mathematically derived stealth addresses. 
          No link between your identity and your balance. Ever.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="font-bold rounded-2xl h-14 px-10 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95" asChild>
            <Link href="/dashboard">
              {isConnected ? "Go to Dashboard" : "Get Started"} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="font-bold rounded-2xl h-14 px-10 text-lg" asChild>
            <Link href="/pay">Send Private Payment</Link>
          </Button>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full py-24 bg-card/30 border-y border-border/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-16 text-center md:text-left">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0">
                <Ghost className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl uppercase tracking-tight">Stealth Addressing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automatically generate a unique, one-time address for every transaction. Senders never see your real wallet address or total balance.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl uppercase tracking-tight">Zero-Link Privacy</h3>
              <p className="text-muted-foreground leading-relaxed">
                By registering subdomains to our stateless contract, we break the on-chain link between your ENS name and your personal identity.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto md:mx-0">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl uppercase tracking-tight">ENS Compatible</h3>
              <p className="text-muted-foreground leading-relaxed">
                Fully integrated with the official ENS Public Resolver. Any CCIP-Read compliant wallet can pay you using just your Zyn handle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="w-full py-32 px-4 max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Non-Custodial by Design</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            All encryption and stealth address derivation happen locally in your browser. 
            The Zyn Protocol never sees your private keys, and your data is stored on decentralized infrastructure.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-200">
          <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter"><Shield className="w-6 h-6" /> ENS</div>
          <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter"><Zap className="w-6 h-6" /> SEPOLIA</div>
          <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter"><Lock className="w-6 h-6" /> EIP-5564</div>
        </div>
      </section>
    </div>
  )
}
