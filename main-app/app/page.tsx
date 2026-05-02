'use client'

import { useState } from 'react'
import { RegisterForm } from '@/components/RegisterForm'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { ShieldCheck, EyeOff, Zap, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { isConnected } = useAccount()
  const [registeredName, setRegisteredName] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-20">
      
      {/* Hero Section */}
      <div className="w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2 border border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Privacy Engine Active
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
          Receive payments <span className="text-primary italic">privately</span>.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Secure your crypto identity. Register a handle and receive funds through one-time, untraceable addresses. 
        </p>
      </div>

      {/* Main Action Area */}
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
        {!isConnected ? (
          <div className="text-center p-12 rounded-3xl border-2 border-dashed border-border bg-card/30 backdrop-blur-sm space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground/30">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Wallet Required</h2>
              <p className="text-muted-foreground mt-2">Please connect your wallet to claim your private name.</p>
            </div>
          </div>
        ) : registeredName ? (
          <div className="text-center p-12 rounded-3xl bg-success/5 border border-success/20 animate-in zoom-in-95 duration-500 shadow-lg shadow-success/5">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 text-success">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-success mb-2">You're Protected!</h2>
            <p className="text-foreground text-lg mb-8 opacity-80">
              Your name <span className="font-black text-success">@{registeredName}.zyn.eth</span> is ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-bold rounded-xl h-12 px-8" asChild>
                <Link href="/dashboard">Open Dashboard <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="font-bold rounded-xl h-12 px-8" asChild>
                <Link href="/pay">Pay Someone Else</Link>
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => setRegisteredName(null)}>
              Register another name
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <RegisterForm onSuccess={(name) => setRegisteredName(name)} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already registered? Check your <Link href="/dashboard" className="text-primary hover:underline font-semibold">Dashboard</Link> or <Link href="/pay" className="text-primary hover:underline font-semibold">Pay someone</Link>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Simplified Features */}
      <div className="grid sm:grid-cols-3 gap-12 w-full max-w-5xl pt-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 border-t border-border/30">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Untraceable</h3>
          <p className="text-sm text-muted-foreground">Every payment uses a fresh address. No one can track your total balance.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Fully Secure</h3>
          <p className="text-sm text-muted-foreground">Encryption happens in your browser. Only you have the keys to your funds.</p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg">Easy to Use</h3>
          <p className="text-sm text-muted-foreground">Built on standard ENS. Anyone can pay you using just your name.</p>
        </div>
      </div>

      <footer className="w-full pb-8 text-center">
        <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/30">
          Powered by Zyn Protocol • Privacy First
        </div>
      </footer>
    </div>
  )
}
