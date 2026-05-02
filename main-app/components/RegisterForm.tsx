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
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function RegisterForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const { address } = useAccount()
  const [name, setName] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [step, setStep] = useState<'' | 'Generating keys...' | 'Encrypting keys...' | 'Waiting for wallet...' | 'Registering...'>('')
  const [error, setError] = useState('')

  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  const { writeContractAsync } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const { isSuccess: isTxConfirmed, isLoading: isTxWaiting } = useWaitForTransactionReceipt({ hash: txHash || undefined })

  // Validation: lowercase, numbers, hyphens only
  const isValid = name.length >= 3 && /^[a-z0-9-]+$/.test(name) && !name.startsWith('-') && !name.endsWith('-')

  // Debounce check for availability
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
      // Save name locally for UX (even though contract is stateless)
      localStorage.setItem(`zyn_name_${address.toLowerCase()}`, name)
      onSuccess(name)
    }
  }, [isTxConfirmed, name, address, onSuccess])

  const handleRegister = async () => {
    if (!address || !isValid || !isAvailable) return
    setError('')

    try {
      // 1. Generate Stealth Keypairs locally
      setStep('Generating keys...')
      await new Promise(r => setTimeout(r, 100))
      const keys = generateStealthKeypairs()

      // 2. Encrypt & Save Keys (to LocalStorage using wallet signature)
      setStep('Encrypting keys...')
      const signature = await signMessageAsync({ message: ENCRYPTION_MESSAGE })
      await saveKeys(address, chainId, signature, keys.spendingPrivKey, keys.viewingPrivKey)

      // 3. Direct Registration on-chain (Zero-Link)
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
      setError(e.message || 'An error occurred during registration')
      setStep('')
    }
  }

  const isLoading = step !== '' || isTxWaiting

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl bg-card/50 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">Choose your name</CardTitle>
        <CardDescription>Register your untraceable ENS subdomain.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Username</Label>
          <div className="relative flex items-center">
            <Input
              id="name"
              placeholder="alice"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              className="pr-[110px] font-medium"
              disabled={isLoading}
            />
            <span className="absolute right-3 text-muted-foreground select-none pointer-events-none">
              .zyn.eth
            </span>
          </div>
          
          {name.length > 0 && (
            <div className="text-sm mt-2 flex items-center gap-2">
              {!isValid ? (
                <span className="text-destructive flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Min 3 chars, letters/numbers/hyphens only.
                </span>
              ) : isChecking ? (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-4 h-4 animate-spin" /> Checking availability...
                </span>
              ) : isAvailable === true ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Available!
                </span>
              ) : isAvailable === false ? (
                <span className="text-destructive flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Already taken
                </span>
              ) : null}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm break-words">
            {error}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button 
          className="w-full font-bold h-12" 
          size="lg"
          disabled={!address || !isValid || isAvailable !== true || isLoading}
          onClick={handleRegister}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isTxWaiting ? 'Waiting for Confirmation...' : step}
            </>
          ) : !address ? (
            'Connect Wallet to Register'
          ) : (
            'Register Name'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
