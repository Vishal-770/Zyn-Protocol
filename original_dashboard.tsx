'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { 
  Shield, 
  RefreshCw, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  Search, 
  ExternalLink,
  Inbox,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function SweepDashboard() {
  const { address } = useAccount()
  const [isScanning, setIsScanning] = useState(false)
  const [stealthFunds, setStealthFunds] = useState<any[]>([])

  const scanFunds = async () => {
    if (!address) return
    setIsScanning(true)
    setStealthFunds([])
    
    toast.info("Scanning Zyn Protocol nodes...", {
      description: "Searching for ephemeral announcements on Sepolia."
    })

    try {
      await new Promise(r => setTimeout(r, 2000))
      const mockFunds = [
        { id: 1, amount: "0.05", sender: "0x742...d12", date: "2 mins ago", status: "Received", hash: "0x123...456" },
        { id: 2, amount: "0.12", sender: "0x981...a42", date: "1 hour ago", status: "Claimed", hash: "0x789...012" },
        { id: 3, amount: "0.01", sender: "0x552...b11", date: "3 hours ago", status: "Received", hash: "0x555...777" }
      ]
      setStealthFunds(mockFunds)
      toast.success("Scan Complete", { description: `Found ${mockFunds.length} stealth transactions.` })
    } catch (e) {
      toast.error("Scan Failed")
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Top Header - Functional Focus */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-border/40 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase italic">Scanner</h1>
          <p className="text-muted-foreground mt-1 font-bold text-xs tracking-widest uppercase opacity-50">
            Zyn Protocol ΓÇó Sepolia Network
          </p>
        </div>
        
        <Button 
          onClick={scanFunds} 
          disabled={isScanning}
          className="rounded-lg h-12 px-8 font-black uppercase tracking-wider text-xs border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all"
        >
          {isScanning ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {isScanning ? "Blockchain Sweep in Progress" : "Initiate Sweep"}
        </Button>
      </div>

      {/* Main Table Area - Full Width */}
      <Card className="border-border/40 bg-card/20 rounded-none overflow-hidden shadow-none">
        <div className="bg-muted/30 p-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Inbox className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Found Transactions</span>
          </div>
        </div>
        
        <div className="p-0">
          {isScanning ? (
            <div className="p-12 space-y-4">
              <Skeleton className="h-14 w-full bg-muted/20" />
              <Skeleton className="h-14 w-full bg-muted/20" />
              <Skeleton className="h-14 w-full bg-muted/20" />
            </div>
          ) : stealthFunds.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-b border-border/20">
                    <th className="px-8 py-5">Origin Hash</th>
                    <th className="px-8 py-5 text-right">Value</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Time Anchor</th>
                    <th className="px-8 py-5 text-right">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {stealthFunds.map((fund) => (
                    <tr key={fund.id} className="hover:bg-primary/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-primary/20" />
                          <p className="text-xs font-mono font-bold tracking-tight text-muted-foreground uppercase">{fund.hash}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-black tracking-tighter">{fund.amount} ETH</span>
                      </td>
                      <td className="px-8 py-6">
                        {fund.status === 'Claimed' ? (
                          <span className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" /> Settled
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 animate-pulse">
                            <Clock className="w-3 h-3" /> Available
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-[10px] font-bold text-muted-foreground/60 uppercase">
                        {fund.date}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="sm" className="h-8 px-4 rounded-md font-black text-[10px] uppercase border border-border/40 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all">
                          Verify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-32 flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-border/40 flex items-center justify-center text-muted-foreground/20">
                <Shield className="w-8 h-8" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-black uppercase tracking-widest">No ephemeral data found</p>
                <p className="text-xs text-muted-foreground font-medium">Initiate a sweep to scan the network.</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

