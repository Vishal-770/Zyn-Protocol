'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount, useSignMessage, usePublicClient, useChainId } from 'wagmi'
import { createWalletClient, custom, parseEther, formatEther, http, hexToBytes, bytesToHex } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { loadKeys, hasKeys, ENCRYPTION_MESSAGE } from '@/lib/keys'
import { checkStealthAddress, computeStealthPrivKey } from '@/lib/stealth'
import * as secp from '@noble/secp256k1'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, RefreshCw, Wallet, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react'

interface Match {
  address: string
  balance: string
  txHash: string
  block: number
  stealthPrivKey: string
}

export function SweepDashboard() {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { signMessageAsync } = useSignMessage()
  
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState('')
  
  // Cache the signature to avoid re-signing during the same session
  const signatureRef = useRef<string | null>(null)
  
  const [isSweeping, setIsSweeping] = useState<string | null>(null)

  const handleScan = async () => {
    if (!address) return
    setIsScanning(true)
    setError('')
    setMatches([])
    
    try {
      // 1. Get or re-use signature to unlock keys
      let signature = signatureRef.current
      if (!signature) {
        setScanStep('Please sign to unlock your keys...')
        signature = await signMessageAsync({ message: ENCRYPTION_MESSAGE })
        signatureRef.current = signature
      }
      
      const keys = await loadKeys(address, chainId, signature)
      if (!keys) {
        throw new Error('No privacy keys found. Make sure you have registered a name with this wallet.')
      }

      const spendingPubKey = secp.getPublicKey(keys.spendingPrivKey, true)

      setScanStep('Fetching announcements...')
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromBlock: 0 }),
      })
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setScanStep(`Scanning ${data.announcements.length} payments...`)
      const found: Match[] = []
      
      for (const log of data.announcements) {
        const { ephemeralPubKey, viewTag, stealthAddress, transactionHash, blockNumber } = log
        
        let result = checkStealthAddress({
          ephemeralPubKey: hexToBytes(ephemeralPubKey as `0x${string}`),
          viewingPrivKey: keys.viewingPrivKey,
          spendingPubKey,
          viewTag
        })

        // Deep scan for legacy/empty metadata
        if (!result.isForMe && viewTag === 0) {
          result = checkStealthAddress({
            ephemeralPubKey: hexToBytes(ephemeralPubKey as `0x${string}`),
            viewingPrivKey: keys.viewingPrivKey,
            spendingPubKey,
            viewTag: undefined
          })
        }

        if (result.isForMe) {
          if (result.stealthAddress?.toLowerCase() === stealthAddress.toLowerCase()) {
            const bal = await publicClient!.getBalance({ address: stealthAddress as `0x${string}` })
            
            if (bal > BigInt(0)) {
              const privKey = computeStealthPrivKey(keys.spendingPrivKey, result.hashedSecret!)
              found.push({
                address: stealthAddress,
                balance: formatEther(bal),
                txHash: transactionHash,
                block: blockNumber,
                stealthPrivKey: bytesToHex(privKey)
              })
            }
          }
        }
      }

      setMatches(found)
      if (found.length === 0) {
        setError('No untraceable payments found for your identity.')
      }
    } catch (e: any) {
      console.error("Scan Error:", e)
      setError(e.shortMessage || e.message || 'Scan failed')
      signatureRef.current = null // Clear signature on error to allow retry
    } finally {
      setIsScanning(false)
      setScanStep('')
    }
  }

  const handleSweep = async (match: Match) => {
    if (!address || !window.ethereum) return
    setIsSweeping(match.address)
    
    try {
      const stealthAccount = privateKeyToAccount(match.stealthPrivKey as `0x${string}`)
      
      const walletClient = createWalletClient({
        account: stealthAccount,
        chain: sepolia,
        transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC)
      })
      const balance = await publicClient!.getBalance({ address: match.address as `0x${string}` })
      
      const gasPrice = await publicClient!.getGasPrice()
      const gasLimit = BigInt(21000)
      const cost = gasPrice * gasLimit
      
      if (balance <= cost) throw new Error('Balance too low for gas fees.')

      const hash = await walletClient.sendTransaction({
        to: address,
        value: balance - cost,
        gas: gasLimit,
        gasPrice
      })

      alert(`Success! Funds recovered. Tx: ${hash.slice(0, 10)}...`)
      setMatches(prev => prev.filter(m => m.address !== match.address))
    } catch (e: any) {
      console.error("Sweep Error:", e)
      alert(e.shortMessage || e.message || 'Sweep failed')
    } finally {
      setIsSweeping(null)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-card/50 backdrop-blur-xl border-white/10">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Privacy Dashboard
            </CardTitle>
            <CardDescription>Securely scan for payments sent to your stealth identity.</CardDescription>
          </div>
          <Button onClick={handleScan} disabled={isScanning} size="lg" className="shadow-lg shadow-primary/20">
            {isScanning ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...</>
            ) : (
              <><RefreshCw className="mr-2 h-4 w-4" /> Scan Blockchain</>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {isScanning && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium text-primary animate-pulse">{scanStep}</p>
          </div>
        )}

        {!isScanning && matches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <Card key={match.address} className="bg-emerald-500/5 border-emerald-500/20 overflow-hidden group">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded truncate flex-1 mr-2">
                      {match.address}
                    </div>
                    <div className="text-lg font-bold text-emerald-500">
                      {match.balance} ETH
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="flex items-center text-xs text-muted-foreground gap-4">
                    <span>Block {match.block}</span>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${match.txHash}`} 
                      target="_blank" 
                      className="flex items-center gap-1 hover:text-primary transition-colors underline"
                    >
                      View Tx <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-500" 
                    onClick={() => handleSweep(match)}
                    disabled={isSweeping === match.address}
                  >
                    {isSweeping === match.address ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      'Recover to Wallet'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isScanning && matches.length === 0 && !error && (
          <div className="text-center py-12 text-muted-foreground opacity-50">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 opacity-20" />
            </div>
            <p>Ready to scan for untraceable payments.</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-muted/30 border-t border-white/5 px-6 py-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <ShieldCheck className="w-3 h-3 inline mr-1 text-primary" />
          Encryption keys are unlocked locally. Your privacy is protected by math.
        </p>
      </CardFooter>
    </Card>
  )
}
