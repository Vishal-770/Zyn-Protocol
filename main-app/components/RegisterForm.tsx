'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useSignMessage, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { isSubdomainAvailable } from '@/lib/ens'
import { generateStealthKeypairs, saveKeys, ENCRYPTION_MESSAGE } from '@/lib/keys'
import { CONTRACTS } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, XCircle, Shield, Key, Fingerprint, Wallet, ArrowRight } from 'lucide-react'
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
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash || undefined })

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
      <div className="w-full space-y-12 animate-in fade-in duration-700">
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-[0.4em] text-primary/60">Desired Handle</Label>
            </div>
            
            <div className="group w-full max-w-2xl">
              <div className="flex items-baseline gap-2 border-b-2 border-border/40 focus-within:border-primary transition-all pb-2">
                <input
                  id="name"
                  placeholder="IDENTIFIER"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase())}
                  className="bg-transparent border-none p-0 focus:ring-0 text-3xl sm:text-4xl font-black uppercase tracking-tighter italic placeholder:opacity-10 w-full outline-none"
                  autoComplete="off"
                />
                <span className="text-xl sm:text-2xl font-black italic uppercase text-muted-foreground/30 group-focus-within:text-primary transition-colors">
                  .zyn.eth
                </span>
              </div>
            </div>
            
            <div className="h-8">
              {name.length > 0 && (
                <div className="text-[11px] px-1 flex items-center gap-3 font-black uppercase tracking-widest italic">
                  {!isValid ? (
                    <span className="text-destructive flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Syntax Rejection
                    </span>
                  ) : isChecking ? (
                    <span className="text-muted-foreground flex items-center gap-2 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Node Availability...
                    </span>
                  ) : isAvailable === true ? (
                    <span className="text-success flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Identifier Available
                    </span>
                  ) : isAvailable === false ? (
                    <span className="text-destructive flex items-center gap-2">
                      <XCircle className="w-4 h-4" /> Identifier Conflict
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <Button 
              className="group h-16 px-12 font-black uppercase tracking-[0.3em] text-xs bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all rounded-none overflow-hidden relative" 
              disabled={!address || !isValid || isAvailable !== true || step !== ''}
              onClick={handleRegister}
            >
              <span className="relative z-10 flex items-center gap-3">
                {!address ? 'Connect Wallet First' : 'Confirm Registration'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </span>
            </Button>
            <p className="mt-4 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
              Standard gas fees apply on Sepolia Network
            </p>
          </div>
        </div>
      </div>

      <Dialog open={step !== ''} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-border/40 bg-background/95 backdrop-blur-xl rounded-none">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-none bg-primary/10 flex items-center justify-center mb-6 text-primary border border-primary/20">
              {step === 'Generating keys...' && <Fingerprint className="w-8 h-8 animate-pulse" />}
              {step === 'Encrypting keys...' && <Key className="w-8 h-8 animate-bounce" />}
              {step === 'Waiting for wallet...' && <Wallet className="w-8 h-8 animate-pulse" />}
              {step === 'Registering...' && <Shield className="w-8 h-8 animate-spin" />}
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tighter italic">{step}</DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-widest font-medium opacity-60">
              {step === 'Generating keys...' && "Creating cryptographic stealth identity..."}
              {step === 'Encrypting keys...' && "Secure local storage in progress..."}
              {step === 'Waiting for wallet...' && "Awaiting on-chain permission..."}
              {step === 'Registering...' && "Anchoring handle to protocol..."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-full bg-muted rounded-none h-1 overflow-hidden">
              <div className="bg-primary h-full animate-progress-fast" style={{ width: '100%' }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
