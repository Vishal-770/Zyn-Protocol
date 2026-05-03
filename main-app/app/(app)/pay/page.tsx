'use client'

import { SendForm } from "@/components/SendForm";
import { Shield, Send, Lock, EyeOff, Zap } from "lucide-react";

export default function PayPage() {
  return (
    <div className="w-full flex flex-col space-y-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-border/40 pb-8 w-full">
        <h1 className="text-4xl font-black tracking-tight uppercase italic">Private Send</h1>
        <p className="text-muted-foreground font-bold text-xs tracking-[0.2em] uppercase opacity-50">
          Zyn Protocol • Zero-Knowledge Asset Transfer
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Left Column - Main Execution Form */}
        <div className="lg:col-span-7 space-y-10">
          <div className="space-y-3">
            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Send className="w-5 h-5 text-primary" /> Execute Transaction
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              Initiate a stealth payment by providing a Zyn handle or a direct stealth meta-address. The recipient's primary wallet remains completely disconnected from the on-chain event.
            </p>
          </div>
          
          <div className="w-full">
            <SendForm />
          </div>
        </div>

        {/* Right Column - Privacy Metrics */}
        <div className="lg:col-span-5 space-y-10 lg:border-l lg:border-border/40 lg:pl-16">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Privacy Engine</h3>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm uppercase text-foreground/80">Stealth Derivation</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Generating a unique, one-time destination address using EIP-5564 elliptic curve math.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm uppercase text-foreground/80">Recipient Obfuscation</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No link is created between the sender and the recipient's real-world identity on the public ledger.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm uppercase text-foreground/80">Relay Propagation</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Announcing transaction metadata through the EphemeralAnnouncer for recipient discovery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/[0.03] border border-primary/10 rounded-none space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Security Protocol</span>
            </div>
            <p className="text-xs text-muted-foreground italic font-medium leading-relaxed">
              "Private Send is a one-way cryptographic event. Ensure the recipient handle is correct before proceeding."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
