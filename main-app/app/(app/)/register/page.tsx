'use client'

import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Claim Your Handle</h1>
        <p className="text-muted-foreground">Secure your privacy-first identity on the Zyn Protocol.</p>
      </div>
      
      <div className="w-full">
        <RegisterForm onSuccess={(name) => {}} />
      </div>
    </div>
  )
}
