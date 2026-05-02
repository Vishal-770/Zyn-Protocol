'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useSignMessage, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { isSubdomainAvailable } from '@/lib/ens'
import { generateStealthKeypairs, saveKeys, ENCRYPTION_MESSAGE } from '@/lib/keys'
import { CONTRACTS } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, XCircle, Shield, Key, Fingerprint, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"

export function RegisterForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const { address } = useAccount()
  const [name, setName] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [step, setStep] = useState<'' | 'Generating keys...' | 'Encrypting keys...' | 'Waiting for wallet...' | 'Registering...'>('')
  
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const { writeContractAsync } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const { isSuccess: isTxConfirmed, isLoading: isTxWaiting } = useWaitForTransactionReceipt({ hash: txHash || undefined })

  const isValid = name.length >= 3 && /^[a-z0-9-]+$/.test(name) && !name.startsWith('-') && !name.endsWith('-')

  useEffect(() => {
    if (!name || !isValid) {
      setIsAvailable(null)
      return
    }
    const timer = setTimeout(async () => {
      setIsChecking(true)
      try {
        const available = await isSubdomainAvailable(name)
        setIsAvailable(available)
      } catch (e) {
        console.error(e)
      } finally {
        setIsChecking(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [name, isValid])

  useEffect(() => {
    if (isTxConfirmed && address) {
      localStorage.setItem(`zyn_name_${address.toLowerCase()}`, name)
      toast.success('Registration complete! Welcome to Zyn.')
      onSuccess(name)
      setStep('')
    }
  }, [isTxConfirmed, name, address, onSuccess])

  const handleRegister = async () => {
    if (!address || !isValid || !isAvailable) return

    try {
      setStep('Generating keys...')
      const keys = generateStealthKeypairs()

      setStep('Encrypting keys...')
      const signature = await signMessageAsync({ message: ENCRYPTION_MESSAGE })
      await saveKeys(address, chainId, signature, keys.spendingPrivKey, keys.viewingPrivKey)

      setStep('Waiting for wallet...')
      const hash = await writeContractAsync({
        address: CONTRACTS.SUBDOMAIN_REGISTRAR.address,
        abi: CONTRACTS.SUBDOMAIN_REGISTRAR.abi,
        functionName: 'register',
        args: [name, keys.stealthMetaAddress],
      })
      
      setTxHash(hash)
      setStep('Registering...')
    } catch (e: any) {
      console.error(e)
      toast.error(e.shortMessage || e.message || 'Registration failed')
      setStep('')
    }
  }

  return (
    <>
      <Card className="w-full max-w-md mx-auto shadow-xl border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Claim your handle</CardTitle>
          <CardDescription>Your privacy-first identity on the Zyn Protocol.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</Label>
            <div className="relative flex items-center group">
              <Input
                id="name"
                placeholder="alice"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                className="pr-[110px] h-12 font-medium bg-background/50 focus-visible:ring-primary/20"
                autoComplete="off"
              />
              <span className="absolute right-4 text-muted-foreground font-medium pointer-events-none select-none">
                .zyn.eth
              </span>
            </div>
            
            {name.length > 0 && (
              <div className="text-sm px-1 flex items-center gap-2">
                {!isValid ? (
                  <span className="text-destructive flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Invalid characters
                  </span>
                ) : isChecking ? (
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Checking...
                  </span>
                ) : isAvailable === true ? (
                  <span className="text-success flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Available for registration
                  </span>
                ) : isAvailable === false ? (
                  <span className="text-destructive flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> This name is already taken
                  </span>
                ) : null}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full font-bold h-12 transition-all active:scale-[0.98]" 
            size="lg"
            disabled={!address || !isValid || isAvailable !== true || step !== ''}
            onClick={handleRegister}
          >
            {!address ? 'Connect Wallet' : 'Register Name'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={step !== ''} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md pointer-events-none">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
              {step === 'Generating keys...' && <Fingerprint className="w-8 h-8 animate-pulse" />}
              {step === 'Encrypting keys...' && <Key className="w-8 h-8 animate-bounce" />}
              {step === 'Waiting for wallet...' && <Wallet className="w-8 h-8 animate-pulse" />}
              {step === 'Registering...' && <Shield className="w-8 h-8 animate-spin" />}
            </div>
            <DialogTitle className="text-xl">{step}</DialogTitle>
            <DialogDescription className="max-w-[280px]">
              {step === 'Generating keys...' && "Creating your cryptographic stealth identity locally..."}
              {step === 'Encrypting keys...' && "Please sign the message to secure your keys in your browser."}
              {step === 'Waiting for wallet...' && "Approve the registration transaction in your wallet."}
              {step === 'Registering...' && "Confirming your transaction on the blockchain..."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full animate-progress-fast" style={{ width: '100%' }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
