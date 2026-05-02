'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { SweepDashboard } from '@/components/SweepDashboard'
import { getStealthMetaAddress } from '@/lib/ens'
import { CONTRACTS } from '@/lib/contracts'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [subdomain, setSubdomain] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [address])

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
        <p className="text-muted-foreground">Please connect your wallet to view your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <SweepDashboard />
    </div>
  )
}
