'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount, useSignMessage, usePublicClient, useChainId } from 'wagmi'
import { createWalletClient, parseEther, formatEther, http, hexToBytes, bytesToHex } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { loadKeys, hasKeys, ENCRYPTION_MESSAGE } from '@/lib/keys'
import { checkStealthAddress, computeStealthPrivKey } from '@/lib/stealth'
import * as secp from '@noble/secp256k1'
import { 
  Shield, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Search, 
  Inbox,
  Lock,
  ArrowUpRight,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function SweepDashboard() {
  const { address } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { signMessageAsync } = useSignMessage()
  
  const [isScanning, setIsScanning] = useState(false)
  const [scanStep, setScanStep] = useState('')
  const [matches, setMatches] = useState<any[]>([])
  const [isSweeping, setIsSweeping] = useState<string | null>(null)
  
  // Cache the signature to avoid re-signing during the same session
  const signatureRef = useRef<string | null>(null)

  const handleScan = async () => {
    if (!address) return
    setIsScanning(true)
    setMatches([])
    
    try {
      // 1. Get or re-use signature to unlock keys
      let signature = signatureRef.current
      if (!signature) {
        setScanStep('Unlocking identity...')
        signature = await signMessageAsync({ message: ENCRYPTION_MESSAGE })
        signatureRef.current = signature
      }
      
      const keys = await loadKeys(address, chainId, signature)
      if (!keys) {
        throw new Error('No privacy keys found. Identity not registered.')
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

      setScanStep(`Scanning ${data.announcements.length} blocks...`)
      const found: any[] = []
      
      for (const log of data.announcements) {
        const { ephemeralPubKey, viewTag, stealthAddress, transactionHash, blockNumber } = log
        
        let result = checkStealthAddress({
          ephemeralPubKey: hexToBytes(ephemeralPubKey as `0x${string}`),
          viewingPrivKey: keys.viewingPrivKey,
          spendingPubKey,
          viewTag
        })

        // Fallback scan for legacy metadata
        if (!result.isForMe && viewTag === 0) {
          result = checkStealthAddress({
            ephemeralPubKey: hexToBytes(ephemeralPubKey as `0x${string}`),
            viewingPrivKey: keys.viewingPrivKey,
            spendingPubKey,
            viewTag: undefined
          })
        }

        if (result.isForMe && result.stealthAddress?.toLowerCase() === stealthAddress.toLowerCase()) {
          const bal = await publicClient!.getBalance({ address: stealthAddress as `0x${string}` })
          
          if (bal > BigInt(0)) {
            const privKey = computeStealthPrivKey(keys.spendingPrivKey, result.hashedSecret!)
            found.push({
              address: stealthAddress,
              balance: formatEther(bal),
              rawBalance: bal,
              txHash: transactionHash,
              block: blockNumber,
              stealthPrivKey: bytesToHex(privKey)
            })
          }
        }
      }

      setMatches(found)
      toast.success(found.length > 0 ? `Detected ${found.length} Active Deposits` : "Scan Complete: No Funds Found")
    } catch (e: any) {
      console.error("Scan Error:", e)
      toast.error("Scanner Fault", { description: e.shortMessage || e.message })
      signatureRef.current = null 
    } finally {
      setIsScanning(false)
      setScanStep('')
    }
  }

  const handleSweep = async (match: any) => {
    if (!address || !window.ethereum) return
    setIsSweeping(match.address)
    
    try {
      const stealthAccount = privateKeyToAccount(match.stealthPrivKey as `0x${string}`)
      
      const walletClient = createWalletClient({
        account: stealthAccount,
        chain: sepolia,
        transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC || "https://rpc2.sepolia.org")
      })
      
      const balance = await publicClient!.getBalance({ address: match.address as `0x${string}` })
      const gasPrice = await publicClient!.getGasPrice()
      const gasLimit = BigInt(21000)
      const cost = gasPrice * gasLimit
      
      if (balance <= cost) throw new Error('Balance insufficient for gas.')

      const hash = await walletClient.sendTransaction({
        to: address,
        value: balance - cost,
        gas: gasLimit,
        gasPrice
      })

      toast.success("Recovery Initialized", { description: `TX: ${hash.slice(0, 10)}...` })
      setMatches(prev => prev.filter(m => m.address !== match.address))
    } catch (e: any) {
      console.error("Sweep Error:", e)
      toast.error("Recovery Failed", { description: e.shortMessage || e.message })
    } finally {
      setIsSweeping(null)
    }
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-border/40 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase italic">Scanner</h1>
          <p className="text-muted-foreground font-bold text-[10px] sm:text-xs tracking-widest uppercase opacity-50">
            Zyn Protocol • Sepolia Testnet
          </p>
        </div>
        
        <Button 
          onClick={handleScan} 
          disabled={isScanning}
          className="w-full sm:w-auto rounded-none h-14 px-8 font-black uppercase tracking-wider text-[10px] sm:text-xs border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all"
        >
          {isScanning ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {scanStep || "Scanning..."}</>
          ) : (
            <><RefreshCw className="mr-2 h-4 w-4" /> Initiate Scan</>
          )}
        </Button>
      </div>

      {/* Transaction Feed */}
      <div className="w-full space-y-6">
        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <Inbox className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground">Detected Unswept Deposits</span>
        </div>
        
        <div className="w-full">
          {isScanning ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full bg-muted/20" />
              <Skeleton className="h-16 w-full bg-muted/20" />
            </div>
          ) : matches.length > 0 ? (
            <div className="w-full space-y-4">
              {/* Mobile Card Layout */}
              <div className="grid grid-cols-1 gap-4 lg:hidden">
                {matches.map((match) => (
                  <div key={match.address} className="p-5 bg-muted/10 border border-border/40 space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <p className="text-[10px] font-mono font-bold tracking-tight text-muted-foreground uppercase">{match.address.slice(0, 10)}...{match.address.slice(-6)}</p>
                      </div>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${match.txHash}`} 
                        target="_blank" 
                        className="p-2 -mr-2 text-muted-foreground/60 hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Liquidity</p>
                        <p className="text-xl font-black italic text-success">{match.balance} ETH</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Status</p>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 justify-end">
                          <Clock className="w-3 h-3" /> Ready
                        </span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleSweep(match)}
                      disabled={!!isSweeping}
                      className="w-full h-12 rounded-none font-black text-[10px] uppercase border border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all"
                    >
                      {isSweeping === match.address ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <><ArrowUpRight className="w-4 h-4 mr-2" /> Recover to Wallet</>
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border/20">
                      <th className="px-4 py-5">Stealth Instance</th>
                      <th className="px-4 py-5">Liquidity</th>
                      <th className="px-4 py-5">Status</th>
                      <th className="px-4 py-5">Origin</th>
                      <th className="px-4 py-5 text-right">Command</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {matches.map((match) => (
                      <tr key={match.address} className="hover:bg-primary/[0.02] transition-colors">
                        <td className="px-4 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <p className="text-xs font-mono font-bold tracking-tight text-muted-foreground uppercase">{match.address.slice(0, 18)}...</p>
                          </div>
                        </td>
                        <td className="px-4 py-6">
                          <p className="text-sm font-black italic text-success">{match.balance} ETH</p>
                        </td>
                        <td className="px-4 py-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Ready
                          </span>
                        </td>
                        <td className="px-4 py-6">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${match.txHash}`} 
                            target="_blank" 
                            className="text-[10px] font-bold text-muted-foreground/60 uppercase hover:text-primary transition-colors flex items-center gap-1"
                          >
                            View Tx <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="px-4 py-6 text-right">
                          <Button 
                            onClick={() => handleSweep(match)}
                            disabled={!!isSweeping}
                            variant="ghost" 
                            size="sm" 
                            className="h-9 px-6 rounded-none font-black text-[10px] uppercase border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            {isSweeping === match.address ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <><ArrowUpRight className="w-3 h-3 mr-2" /> Recover to Wallet</>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-border/40 flex items-center justify-center text-muted-foreground/20">
                <Shield className="w-8 h-8" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black uppercase tracking-widest">Zero active ephemeral funds</p>
                <p className="text-xs text-muted-foreground font-medium italic">
                  Initiate a protocol scan to verify your private balance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
