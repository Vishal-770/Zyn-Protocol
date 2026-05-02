'use client'

import { useState } from 'react'
import { useSendTransaction } from 'wagmi'
import { parseEther, bytesToHex } from 'viem'
import { resolveToStealthData } from '@/lib/ens'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Search, ArrowRight, RefreshCw, CheckCircle2, Copy } from 'lucide-react'

export function SendForm() {
  const [name, setName] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [resolveError, setResolveError] = useState('')
  
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
    setResolveError('')
    setStealthAddress(null)
    setEphemeralPubKey(null)
    setViewTag(null)
    setStep('')

    try {
      const result = await resolveToStealthData(name)
      if (!result) {
        setResolveError('Name not found or not registered')
      } else {
        setStealthAddress(result.address)
        setEphemeralPubKey(bytesToHex(result.ephemeralPubKey))
        setViewTag(result.viewTag)
      }
    } catch (e: any) {
      setResolveError('Failed to resolve name')
    } finally {
      setIsResolving(false)
    }
  }

  const handleSend = async () => {
    if (!stealthAddress || !ephemeralPubKey || !amount) return
    
    try {
      setStep('Sending ETH...')
      // 1. Send ETH to the stealth address
      await sendTransactionAsync({
        to: stealthAddress as `0x${string}`,
        value: parseEther(amount),
      })

      // 2. Announce via Relayer (Privacy Fix)
      // No user signature needed anymore - minimalist approach
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
    } catch (e: any) {
      console.error(e)
      setResolveError(e.shortMessage || e.message || 'Transaction failed')
      setStep('')
    }
  }

  const copyAddress = () => {
    if (stealthAddress) {
      navigator.clipboard.writeText(stealthAddress)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl bg-card/50 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Pay privately</CardTitle>
        <CardDescription>Send ETH to an untraceable one-time address.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-2">
          <Label htmlFor="pay-name">ENS Name</Label>
          <div className="flex gap-2">
            <Input
              id="pay-name"
              placeholder="alice.zyn.eth"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              disabled={isResolving || step !== ''}
            />
            <Button onClick={handleResolve} disabled={!name || isResolving || step !== ''}>
              {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {resolveError && <p className="text-sm text-destructive mt-1">{resolveError}</p>}
        </div>

        {stealthAddress && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-emerald-500">One-time address generated:</span>
                <Button variant="ghost" size="sm" onClick={handleResolve} className="h-6 px-2 text-xs" disabled={step !== ''}>
                  <RefreshCw className="w-3 h-3 mr-1" /> New Address
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono flex-1 truncate text-foreground">
                  {stealthAddress}
                </code>
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={copyAddress}>
                  {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={step !== ''}
              />
            </div>

            {step === 'Done' ? (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-emerald-500">Payment sent privately!</p>
                <Button variant="outline" className="mt-4 w-full" onClick={() => {
                  setStealthAddress(null)
                  setStep('')
                  setName('')
                }}>
                  Send Another
                </Button>
              </div>
            ) : (
              <Button 
                className="w-full font-bold h-12" 
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
                    Send ETH <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
