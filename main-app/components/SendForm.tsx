'use client'

import { useState } from 'react'
import { useSendTransaction } from 'wagmi'
import { parseEther, bytesToHex } from 'viem'
import { resolveToStealthData } from '@/lib/ens'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Search, ArrowRight, RefreshCw, CheckCircle2, Copy, Shield, Zap, TrendingUp, User } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function SendForm() {
  const [name, setName] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  
  const [stealthAddress, setStealthAddress] = useState<string | null>(null)
  const [ephemeralPubKey, setEphemeralPubKey] = useState<string | null>(null)
  const [viewTag, setViewTag] = useState<number | null>(null)
  
  const [amount, setAmount] = useState('0.001')
  const [isCopied, setIsCopied] = useState(false)
  const [step, setStep] = useState<'' | 'Sending ETH...' | 'Announcing...' | 'Done'>('')

  const { sendTransactionAsync } = useSendTransaction()

  const handleResolve = async () => {
    if (!name) return
    setIsResolving(true)
    setStealthAddress(null)
    setEphemeralPubKey(null)
    setViewTag(null)
    setStep('')

    try {
      const result = await resolveToStealthData(name)
      if (!result) {
        toast.error('ENS name not found or no stealth record set.')
      } else {
        setStealthAddress(result.address)
        setEphemeralPubKey(bytesToHex(result.ephemeralPubKey))
        setViewTag(result.viewTag)
        toast.success(`Resolved ${name}`)
      }
    } catch (e: any) {
      toast.error('Failed to resolve ENS name.')
    } finally {
      setIsResolving(false)
    }
  }

  const handleSend = async () => {
    if (!stealthAddress || !ephemeralPubKey || !amount) return
    
    try {
      setStep('Sending ETH...')
      await sendTransactionAsync({
        to: stealthAddress as `0x${string}`,
        value: parseEther(amount),
      })

      setStep('Announcing...')
      const schemeId = BigInt(0)

      const res = await fetch('/api/relay-announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: schemeId.toString(),
          stealthAddress,
          ephemeralPubKey,
          viewTag: viewTag || 0
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setStep('Done')
      toast.success('Payment sent and announced!')
    } catch (e: any) {
      console.error(e)
      toast.error(e.shortMessage || e.message || 'Transaction failed')
      setStep('')
    }
  }

  const copyAddress = () => {
    if (stealthAddress) {
      navigator.clipboard.writeText(stealthAddress)
      setIsCopied(true)
      toast.success('Address copied to clipboard')
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-700">
      
      {/* Recipient Input Area */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Recipient Identity</Label>
        </div>
        
        <div className="flex items-baseline gap-4 border-b-2 border-border/40 focus-within:border-primary transition-all pb-2 max-w-2xl group">
          <input
            id="pay-name"
            placeholder="USER-HANDLE"
            value={name}
            onChange={(e) => setName(e.target.value.toLowerCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleResolve()}
            className="bg-transparent border-none p-0 focus:ring-0 text-3xl sm:text-4xl font-black uppercase tracking-tighter italic placeholder:opacity-10 w-full outline-none"
            disabled={isResolving || step !== ''}
          />
          <button 
            onClick={handleResolve}
            disabled={!name || isResolving || step !== ''}
            className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-20"
          >
            {isResolving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Dynamic Resolution & Amount Area */}
      {stealthAddress && (
        <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
          
          {/* Status Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-muted/20 border border-border/40 rounded-none">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-success/70">Stealth Resolved</p>
                <code className="text-xs font-mono font-bold tracking-tight text-muted-foreground uppercase truncate block max-w-[200px] sm:max-w-xs italic">
                  {stealthAddress}
                </code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyAddress} className="h-9 px-4 text-[10px] uppercase font-black tracking-widest border border-border/40 rounded-none">
                {isCopied ? "Copied" : "Copy Hash"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleResolve} className="h-9 w-9 p-0 border border-border/40 rounded-none" disabled={step !== ''}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Amount Area */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Transfer Value</Label>
            </div>
            
            <div className="flex items-baseline gap-4 border-b-2 border-border/40 focus-within:border-primary transition-all pb-2 max-w-[300px] group">
              <input
                id="amount"
                type="number"
                min="0"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent border-none p-0 focus:ring-0 text-5xl font-black tracking-tighter italic placeholder:opacity-10 w-full outline-none"
                disabled={step !== ''}
              />
              <span className="text-2xl font-black italic uppercase text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                ETH
              </span>
            </div>
          </div>

          {/* Execution Action */}
          <div className="pt-6">
            {step === 'Done' ? (
              <div className="flex items-center gap-6 p-8 border-2 border-success/30 bg-success/[0.02] animate-in zoom-in-95 duration-500">
                <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black uppercase italic tracking-tight text-success">Transaction Settled</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Protocol announcement broadcasted successfully.</p>
                  <Button variant="link" className="p-0 h-auto text-xs font-black uppercase tracking-widest text-primary mt-2" onClick={() => {
                    setStealthAddress(null)
                    setStep('')
                    setName('')
                  }}>
                    Execute New Transfer <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  className="group h-16 px-12 font-black uppercase tracking-[0.3em] text-xs bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all rounded-none overflow-hidden relative" 
                  onClick={handleSend}
                  disabled={!amount || step !== ''}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {step !== '' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {step}
                      </>
                    ) : (
                      <>
                        Initiate Private Transfer
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                      </>
                    )}
                  </span>
                </Button>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                  <Zap className="w-3 h-3" /> EIP-5564 Cryptography Active
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
