'use client'

import { RegisterForm } from "@/components/RegisterForm";
import { useState } from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [registeredName, setRegisteredName] = useState<string | null>(null);

  if (registeredName) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success mb-2">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-success">Handle Claimed!</h1>
          <p className="text-xl text-muted-foreground">
            Your private identity <span className="text-foreground font-bold">@{registeredName}.zyn.eth</span> is now active.
          </p>
        </div>
        <div className="flex gap-4 pt-4">
          <Button size="lg" className="font-bold rounded-xl h-12 px-8" asChild>
            <Link href="/dashboard">Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" /></Link>
          </Button>
          <Button variant="outline" size="lg" className="font-bold rounded-xl h-12 px-8" asChild>
            <Link href="/pay">Send a Payment</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight">Claim your handle</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Secure your privacy-first identity on the Zyn Protocol. This will be your public gateway to private payments.
        </p>
      </div>
      
      <div className="w-full">
        <RegisterForm onSuccess={(name) => setRegisteredName(name)} />
      </div>
    </div>
  )
}
