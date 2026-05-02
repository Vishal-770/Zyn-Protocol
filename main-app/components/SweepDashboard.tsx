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
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, RefreshCw, Wallet, ExternalLink, ShieldCheck, AlertCircle, Coins, Search, ArrowDownToLine, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

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
  
  const signatureRef = useRef<string | null>(null)
  const [isSweeping, setIsSweeping] = useState<string | null>(null)

  const handleScan = async () => {
    if (!address) return
    setIsScanning(true)
    setMatches([])
    
    try {
      let signature = signatureRef.current
      if (!signature) {
        setScanStep('Unlocking your privacy keys...')
        signature = await signMessageAsync({ message: ENCRYPTION_MESSAGE })
        signatureRef.current = signature
      }
      
      const keys = await loadKeys(address, chainId, signature)
      if (!keys) {
        throw new Error('No privacy keys found. Please register a name first.')
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

      setScanStep(`Scanning ${data.announcements.length} logs...`)
      const found: Match[] = []
      
      for (const log of data.announcements) {
        const { ephemeralPubKey, viewTag, stealthAddress, transactionHash, blockNumber } = log
        
        let result = checkStealthAddress({
          ephemeralPubKey: hexToBytes(ephemeralPubKey as `0x${string}`),
          viewingPrivKey: keys.viewingPrivKey,
          spendingPubKey,
          viewTag
        })

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
              txHash: transactionHash,
              block: blockNumber,
              stealthPrivKey: bytesToHex(privKey)
            })
          }
        }
      }

      setMatches(found)
      if (found.length === 0) {
        toast.info('No new payments found.')
      } else {
        toast.success(`Found ${found.length} untraceable payments!`)
      }
    } catch (e: any) {
      console.error("Scan Error:", e)
      toast.error(e.shortMessage || e.message || 'Scan failed')
      signatureRef.current = null
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
      
      if (balance <= cost) throw new Error('Balance too low for recovery gas.')

      const hash = await walletClient.sendTransaction({
        to: address,
        value: balance - cost,
        gas: gasLimit,
        gasPrice
      })

      toast.success('Funds recovered successfully!')
      setMatches(prev => prev.filter(m => m.address !== match.address))
    } catch (e: any) {
      console.error("Sweep Error:", e)
      toast.error(e.shortMessage || e.message || 'Recovery failed')
    } finally {
      setIsSweeping(null)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="shadow-xl border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Privacy Dashboard
            </CardTitle>
            <CardDescription>Securely discover funds sent to your stealth handle.</CardDescription>
          </div>
          <Button onClick={handleScan} disabled={isScanning} size="lg" className="h-11 px-6 shadow-lg shadow-primary/10">
            {isScanning ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...</>
            ) : (
              <><Search className="mr-2 h-4 w-4" /> Scan Blockchain</>
            )}
          </Button>
        </CardHeader>
        
        <CardContent>
          {isScanning ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((match) => (
                <Card key={match.address} className="bg-success/5 border-success/20 overflow-hidden group transition-all hover:border-success/40">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                        <Coins className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-success/80">Stealth Asset</span>
                    </div>
                    <div className="text-xl font-bold text-success">
                      {match.balance} <span className="text-xs opacity-70">ETH</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-4">
                    <div className="bg-background/40 p-2 rounded border border-success/10 text-[11px] font-mono truncate text-muted-foreground">
                      {match.address}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground/60 px-0.5">
                      <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Block {match.block}</span>
                      <a href={`https://sepolia.etherscan.io/tx/${match.txHash}`} target="_blank" className="hover:text-primary transition-colors flex items-center gap-1 underline">
                        View Log <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <Button 
                      className="w-full bg-success hover:bg-success/90 text-success-foreground font-bold transition-all active:scale-[0.98]" 
                      onClick={() => handleSweep(match)}
                      disabled={isSweeping !== null}
                    >
                      {isSweeping === match.address ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <><ArrowDownToLine className="w-4 h-4 mr-2" /> Recover Funds</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border/50">
              <div className="w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50">
                <Search className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground/80">No payments found</h3>
              <p className="text-sm text-muted-foreground/50 max-w-xs mx-auto mt-1">
                Your wallet is correctly configured. Scan periodically to check for new untraceable payments.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-muted/30 border-t py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Zero-Link Security: Only your local viewing key can decrypt these payments.
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isSweeping !== null} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md pointer-events-none">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 text-success">
              <ArrowDownToLine className="w-8 h-8 animate-bounce" />
            </div>
            <DialogTitle className="text-xl">Recovering Funds</DialogTitle>
            <DialogDescription className="max-w-[280px]">
              Transferring your untraceable ETH to your main wallet address...
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-success h-full animate-progress-fast" style={{ width: '100%' }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
