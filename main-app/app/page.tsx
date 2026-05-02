'use client'

import { useState } from 'react'
import { RegisterForm } from '@/components/RegisterForm'
import { SendForm } from '@/components/SendForm'
import { SweepDashboard } from '@/components/SweepDashboard'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, EyeOff, Zap, Shield, Send, Inbox } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const { isConnected, address } = useAccount()
  const [registeredName, setRegisteredName] = useState<string | null>(null)

  return (
    <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      
      {/* Hero Section */}
      <div className="w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2 border border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5" /> Zero-Link Protocol Active
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
          Privacy is now a <span className="text-primary italic">right</span>,<br />not a luxury.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Zyn allows you to receive payments through mathematically derived stealth addresses. 
          No link between your identity and your balance. Ever.
        </p>
      </div>

      {/* Main Interface */}
      <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
        {!isConnected ? (
          <div className="text-center p-12 rounded-3xl border-2 border-dashed border-border bg-card/30 backdrop-blur-sm space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground/30">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Secure Connection Required</h2>
              <p className="text-muted-foreground mt-2">Please connect your wallet to interact with the Zyn Protocol.</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14 p-1.5 bg-muted/50 rounded-2xl border border-border/50">
              <TabsTrigger value="register" className="rounded-xl font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <Shield className="w-4 h-4" /> Register
              </TabsTrigger>
              <TabsTrigger value="send" className="rounded-xl font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <Send className="w-4 h-4" /> Send
              </TabsTrigger>
              <TabsTrigger value="receive" className="rounded-xl font-bold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">
                <Inbox className="w-4 h-4" /> Dashboard
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="register">
                {registeredName ? (
                  <div className="text-center p-12 rounded-3xl bg-success/5 border border-success/20 animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 text-success">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-success mb-2">Registration Success!</h2>
                    <p className="text-foreground text-lg mb-8 opacity-80">
                      Your identity <span className="font-black text-success">@{registeredName}.zyn.eth</span> is now private.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" size="lg" className="font-bold rounded-xl h-12" onClick={() => setRegisteredName(null)}>
                        Back
                      </Button>
                      <Button size="lg" className="font-bold rounded-xl h-12 px-8 shadow-lg shadow-primary/20" asChild>
                        <Link href="/dashboard">View Dashboard</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <RegisterForm onSuccess={(name) => setRegisteredName(name)} />
                )}
              </TabsContent>
              
              <TabsContent value="send">
                <SendForm />
              </TabsContent>
              
              <TabsContent value="receive">
                <SweepDashboard />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>

      {/* Trust Pillars */}
      <div className="grid sm:grid-cols-3 gap-12 w-full max-w-5xl pt-12 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
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

      <footer className="w-full pt-20 pb-8 border-t border-border/30 text-center space-y-4">
        <div className="text-sm font-medium text-muted-foreground/50">
          © 2026 Zyn Protocol. Built with 🛡️ on Sepolia.
        </div>
      </footer>
    </div>
  )
}
