'use client'

import { RegisterForm } from "@/components/RegisterForm";
import { useState } from "react";
import { ShieldCheck, ArrowRight, Shield, Globe, Lock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [registeredName, setRegisteredName] = useState<string | null>(null);

  if (registeredName) {
    return (
      <div className="w-full flex flex-col items-start space-y-12 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2 border-b border-border/40 pb-8 w-full">
          <h1 className="text-4xl font-black tracking-tight uppercase italic text-success flex items-center gap-4">
            <ShieldCheck className="w-10 h-10" /> Identity Secured
          </h1>
          <p className="text-muted-foreground font-bold text-xs tracking-[0.2em] uppercase opacity-50">
            Zyn Protocol • Registry Active
          </p>
        </div>

        <div className="space-y-6 max-w-2xl">
          <p className="text-2xl font-medium leading-relaxed">
            Your private handle <span className="font-black text-foreground underline decoration-primary decoration-4 underline-offset-8">@{registeredName}.zyn.eth</span> has been successfully anchored to the Sepolia network.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4 pt-8">
            <Button size="lg" className="font-black rounded-lg h-14 px-8 uppercase tracking-widest text-xs" asChild>
              <Link href="/dashboard">Access Terminal <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="font-black rounded-lg h-14 px-8 uppercase tracking-widest text-xs" asChild>
              <Link href="/pay">Execute Payment</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-12 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-border/40 pb-8 w-full">
        <h1 className="text-4xl font-black tracking-tight uppercase italic">Registry</h1>
        <p className="text-muted-foreground font-bold text-xs tracking-[0.2em] uppercase opacity-50">
          Zyn Protocol • Universal Identity Provider
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Left Column - Main Form */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-tighter">Claim Handle</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              Register your Zyn handle to enable stealth addressing. This handle will act as your public gateway while keeping your primary wallet address hidden.
            </p>
          </div>
          
          <div className="w-full">
            <RegisterForm onSuccess={(name) => setRegisteredName(name)} />
          </div>
        </div>

        {/* Right Column - Protocol Info */}
        <div className="lg:col-span-5 space-y-10 lg:border-l lg:border-border/40 lg:pl-16">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Protocol Specs</h3>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm uppercase">ENS Integrated</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Uses standard ENS Public Resolver architecture for universal compatibility.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm uppercase">Stateless Registry</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Zero-link architecture breaks the on-chain mapping between you and your handle.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border/40">
                  <Key className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm uppercase">Local Encryption</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All cryptographic keys are generated and stored exclusively in your browser.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-card/20 border border-border/40 rounded-none space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Network Status</span>
            </div>
            <p className="text-xs text-muted-foreground italic font-medium leading-relaxed">
              "Registration requires a standard transaction on the Sepolia network. Gas fees apply."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
