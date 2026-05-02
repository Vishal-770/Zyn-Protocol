'use client'

import { useState } from 'react'
import { useSendTransaction } from 'wagmi'
import { parseEther, bytesToHex } from 'viem'
import { resolveToStealthData } from '@/lib/ens'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Search, ArrowRight, RefreshCw, CheckCircle2, Copy, Shield, ExternalLink, Zap } from 'lucide-react'
import { toast } from 'sonner'

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
    <Card className="w-full max-w-md mx-auto shadow-xl border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Send privately</CardTitle>
        <CardDescription>Resolve an ENS name and pay to a unique stealth address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-2">
          <Label htmlFor="pay-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recipient ENS</Label>
          <div className="flex gap-2">
            <Input
              id="pay-name"
              placeholder="alice.zyn.eth"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              className="h-12 bg-background/50"
              disabled={isResolving || step !== ''}
              onKeyDown={(e) => e.key === 'Enter' && handleResolve()}
            />
            <Button 
              size="icon" 
              className="h-12 w-12 shrink-0"
              onClick={handleResolve} 
              disabled={!name || isResolving || step !== ''}
            >
              {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {stealthAddress && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-success uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" /> Stealth Address Generated
                </div>
                <Button variant="ghost" size="sm" onClick={handleResolve} className="h-6 px-2 text-[10px] uppercase font-bold" disabled={step !== ''}>
                  <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                </Button>
              </div>
              <div className="flex items-center gap-2 bg-background/50 p-2.5 rounded border border-border/50">
                <code className="text-[13px] font-mono flex-1 truncate text-foreground/80">
                  {stealthAddress}
                </code>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyAddress}>
                  {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount (ETH)</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 pl-4 pr-12 text-lg font-semibold bg-background/50"
                  disabled={step !== ''}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">ETH</span>
              </div>
            </div>

            {step === 'Done' ? (
              <div className="p-6 rounded-lg bg-success/10 border border-success/20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto text-success">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-success">Payment Sent!</h4>
                  <p className="text-xs text-muted-foreground mt-1">Funds are now private on-chain.</p>
                </div>
                <Button variant="outline" size="sm" className="w-full h-10 font-bold" onClick={() => {
                  setStealthAddress(null)
                  setStep('')
                  setName('')
                }}>
                  Send Another
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full font-bold h-12 text-lg transition-all active:scale-[0.98]" 
                size="lg" 
                onClick={handleSend}
                disabled={!amount || step !== ''}
              >
                {step !== '' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {step}
                  </>
                ) : (
                  <>
                    Send Payment <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/30 border-t py-3 justify-center">
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Zap className="w-3 h-3" /> Powered by EIP-5564 & Zero-Link Architecture
        </p>
      </CardFooter>
    </Card>
  )
}
