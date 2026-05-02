'use client'

import { useState } from 'react'
import { SendForm } from '@/components/SendForm'

export default function PayPage() {
  return (
    <div className="flex flex-col items-center py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Send Private Payment</h1>
        <p className="text-muted-foreground">Type an ENS name to generate a secure, one-time payment address.</p>
      </div>
      
      <div className="w-full">
        <SendForm />
      </div>
    </div>
  )
}
