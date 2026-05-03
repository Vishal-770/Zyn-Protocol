'use client'

import { useState, useRef } from 'react'
import { useAccount, useSignMessage, useChainId } from 'wagmi'
import { Fingerprint, Loader2, User, Globe, ExternalLink, ShieldCheck, Search, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { loadKeys, ENCRYPTION_MESSAGE, computeStealthMetaAddress } from '@/lib/keys'

export function IdentityDashboard() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { signMessageAsync } = useSignMessage()
  
  const [isLoading, setIsLoading] = useState(false)
  const [identities, setIdentities] = useState<any[]>([])
  const [hasUnlocked, setHasUnlocked] = useState(false)
  
  const signatureRef = useRef<string | null>(null)

  const handleUnlock = async () => {
    if (!address) return
    setIsLoading(true)
    
    try {
      let signature = signatureRef.current
      if (!signature) {
        signature = await signMessageAsync({ message: ENCRYPTION_MESSAGE })
        signatureRef.current = signature
      }
      
      const keys = await loadKeys(address, chainId, signature)
      if (!keys) {
        throw new Error('Identity not registered.')
      }

      const metaAddress = computeStealthMetaAddress(keys.spendingPrivKey, keys.viewingPrivKey)

      const res = await fetch('/api/identities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stealthMetaAddress: metaAddress }),
      })
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setIdentities(data.registrations)
      setHasUnlocked(true)
      toast.success(`Identity Unlocked`, { description: `Found ${data.registrations.length} registered names.` })
    } catch (e: any) {
      console.error("Unlock Error:", e)
      toast.error("Identity Error", { description: e.shortMessage || e.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* Vault Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-border/40 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase italic flex items-center gap-3">
            Identity Vault
          </h1>
          <p className="text-muted-foreground mt-1 font-bold text-[10px] tracking-widest uppercase opacity-50 flex items-center gap-2">
            Zyn Protocol • Zero-Link Namespace
          </p>
        </div>
        
        {!hasUnlocked && (
          <Button 
            onClick={handleUnlock} 
            disabled={isLoading}
            className="rounded-none h-14 px-8 font-black uppercase tracking-wider text-xs border-2 border-primary bg-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-all group"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Decrypting...</>
            ) : (
              <><Fingerprint className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" /> Unlock Vault</>
            )}
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {!hasUnlocked ? (
          <div className="py-32 flex flex-col items-center text-center space-y-6 bg-muted/5 border-2 border-dashed border-border/20">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary/40">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="max-w-md space-y-2 px-6">
              <h3 className="text-sm font-black uppercase tracking-widest">Encrypted Metadata Layer</h3>
              <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                Your registered names are decoupled from your wallet address. Sign with your master key to generate your Stealth Meta-Address and reveal your private identities.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleUnlock} className="rounded-none font-black text-[10px] uppercase tracking-widest">
              Initiate Secure Handshake
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border/40 pb-4">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Active Subdomain Instances</span>
            </div>

            {identities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {identities.map((id) => (
                  <div key={id.id} className="p-6 bg-muted/10 border border-border/40 hover:border-primary/40 transition-colors space-y-4 group">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <User className="w-4 h-4" />
                      </div>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${id.transactionHash}`} 
                        target="_blank"
                        className="text-muted-foreground/40 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    
                    <div>
                      <p className="text-2xl font-black italic tracking-tighter uppercase group-hover:text-primary transition-colors">
                        {id.id}.zyn.eth
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          Status: Active
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/20">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Registered Block</p>
                      <p className="text-xs font-mono font-bold">{id.blockNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center space-y-6">
                <Search className="w-12 h-12 text-muted-foreground/20" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-black uppercase tracking-widest">No Identities Found</p>
                  <p className="text-xs text-muted-foreground font-medium italic">
                    This meta-address has no active subdomains registered.
                  </p>
                </div>
              </div>
            )}
            
            <div className="p-6 bg-primary/[0.02] border border-primary/10 flex items-start gap-4 mt-12">
              <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Privacy Note</p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  Even though you are viewing these names in your dashboard, there is **zero link** on the Ethereum blockchain between your current wallet and these names. The indexer is only mapping your names to your Stealth Meta-Address, which is independent of your public wallet history.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
