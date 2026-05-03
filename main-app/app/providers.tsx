'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { getWagmiConfig } from '@/lib/wagmi'
import { useState, useEffect, useMemo } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const queryClient = useMemo(() => new QueryClient(), [])
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const config = useMemo(() => {
    // This will only be called on the client
    return getWagmiConfig()
  }, [])

  // IMPORTANT: We only render the providers and children once mounted.
  // This prevents the "WagmiProviderNotFoundError" and "indexedDB" server errors.
  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
