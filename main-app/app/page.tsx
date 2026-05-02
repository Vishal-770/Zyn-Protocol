'use client'

import { useState } from 'react'
import { RegisterForm } from '@/components/RegisterForm'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, EyeOff, Zap } from 'lucide-react'

export default function Home() {
  const { isConnected } = useAccount()
  const [registeredName, setRegisteredName] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-3xl text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <ShieldCheck className="w-4 h-4" /> Live on Sepolia
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground mb-6">
          Your private Web3 identity.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Register a <span className="text-foreground font-semibold">.zyn.eth</span> subdomain. 
          Every time someone pays you, they send to a fresh, mathematically-linked stealth address. 
          Total privacy, zero linkability.
        </p>
      </div>

      {/* Main Action Area */}
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
        {registeredName ? (
          <div className="text-center p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <h2 className="text-3xl font-bold text-emerald-500 mb-2">Success! 🎉</h2>
            <p className="text-foreground text-lg mb-6">
              You are now <span className="font-bold">{registeredName}.zyn.eth</span>
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
            >
              Go to your Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        ) : (
          <RegisterForm onSuccess={(name) => setRegisteredName(name)} />
        )}
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mt-24 text-center animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-xl bg-card border flex items-center justify-center mx-auto text-primary">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg">Untraceable</h3>
          <p className="text-sm text-muted-foreground">Addresses are unique per transaction. Senders never see your real balance.</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-xl bg-card border flex items-center justify-center mx-auto text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg">Non-custodial</h3>
          <p className="text-sm text-muted-foreground">Cryptography runs in your browser. We never see your private keys.</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-xl bg-card border flex items-center justify-center mx-auto text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg">ENS Powered</h3>
          <p className="text-sm text-muted-foreground">Built on standard CCIP-Read. Any wallet can resolve and pay you.</p>
        </div>
      </div>
    </div>
  )
}
