'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'

export function WalletConnect() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-32 h-10 bg-white/5 rounded-lg animate-pulse" />

  return <ConnectButton showBalance={false} />
}
