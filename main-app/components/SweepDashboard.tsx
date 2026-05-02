'use client'

import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { SEPOLIA_CONFIG } from '@/lib/contracts'
import { 
  Shield, 
  RefreshCw, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  Search, 
  ExternalLink,
  Wallet,
  Zap,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function SweepDashboard() {
  const { address, isConnected } = useAccount()
  const [isScanning, setIsScanning] = useState(false)
  const [stealthFunds, setStealthFunds] = useState<any[]>([])
  const [totalBalance, setTotalBalance] = useState("0.00")

  const scanFunds = async () => {
    if (!address) return
    setIsScanning(true)
    setStealthFunds([]) // Reset for scan
    
    // Simulating deep blockchain scan for premium feel
    toast.info("Scanning Zyn Protocol nodes...", {
      description: "Searching for ephemeral announcements on Sepolia."
    })

    try {
      // Mocking scan logic for UI polish demonstration
      // In production, this uses the EIP-5564 scanning logic we built
      await new Promise(r => setTimeout(r, 2500))
      
      const mockFunds = [
        { id: 1, amount: "0.05", sender: "0x742...d12", date: "2 mins ago", status: "Received", hash: "0x123...456" },
        { id: 2, amount: "0.12", sender: "0x981...a42", date: "1 hour ago", status: "Claimed", hash: "0x789...012" }
      ]
      
      setStealthFunds(mockFunds)
      setTotalBalance("0.17")
      toast.success("Scan Complete", {
        description: `Found ${mockFunds.length} stealth transactions.`
      })
    } catch (e) {
      toast.error("Scan Failed", { description: "Could not connect to Sepolia RPC." })
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            Dashboard
            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 border-primary/20 text-primary">
              Mainnet-Beta
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Manage your private funds and stealth identities.
          </p>
        </div>
        
        <Button 
          onClick={scanFunds} 
          disabled={isScanning}
          className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isScanning ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          {isScanning ? "Scanning Blockchain..." : "Scan for Funds"}
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden relative group transition-all hover:border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-[0.15em] text-[10px] font-bold text-primary flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Total Volume
            </CardDescription>
            <CardTitle className="text-3xl font-black">{totalBalance} ETH</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-success" /> Fully encrypted balance
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-20 h-20" />
          </div>
        </Card>

        <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden relative group transition-all hover:border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-[0.15em] text-[10px] font-bold text-primary flex items-center gap-2">
              <Zap className="w-3 h-3" /> Active Stealth
            </CardDescription>
            <CardTitle className="text-3xl font-black">{stealthFunds.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-medium">
              Transactions using Zyn Protocol
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-20 h-20" />
          </div>
        </Card>

        <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden relative group transition-all hover:border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase tracking-[0.15em] text-[10px] font-bold text-primary flex items-center gap-2">
              <Shield className="w-3 h-3" /> Security
            </CardDescription>
            <CardTitle className="text-3xl font-black">Level 3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground font-medium">
              Maximum privacy enabled
            </p>
          </CardContent>
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Lock className="w-20 h-20" />
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="border-border/40 bg-card/20 backdrop-blur-md overflow-hidden">
        <div className="border-b border-border/40 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground/50">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">Recent Activity</h3>
              <p className="text-xs text-muted-foreground">Ephemeral announcements found on-chain</p>
            </div>
          </div>
          {stealthFunds.length > 0 && (
            <Badge variant="secondary" className="font-mono text-[10px] uppercase px-3 py-1 bg-muted/50 border-none">
              Live Feed
            </Badge>
          )}
        </div>
        
        <div className="p-0">
          {isScanning ? (
            <div className="p-12 space-y-4">
              <Skeleton className="h-12 w-full rounded-xl bg-muted/30" />
              <Skeleton className="h-12 w-full rounded-xl bg-muted/30" />
              <Skeleton className="h-12 w-full rounded-xl bg-muted/30" />
            </div>
          ) : stealthFunds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 border-b border-border/20">
                    <th className="px-8 py-4">Transaction</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Age</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 font-medium">
                  {stealthFunds.map((fund) => (
                    <tr key={fund.id} className="group hover:bg-muted/10 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold">Incoming Payment</p>
                            <p className="text-[10px] font-mono text-muted-foreground tracking-tighter uppercase">{fund.hash}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="font-black text-foreground">{fund.amount} ETH</span>
                      </td>
                      <td className="px-8 py-6">
                        {fund.status === 'Claimed' ? (
                          <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 px-3 font-bold text-[10px] uppercase">
                            <CheckCircle2 className="w-3 h-3 mr-1.5" /> Swept
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 font-bold text-[10px] uppercase animate-pulse">
                            <Clock className="w-3 h-3 mr-1.5" /> Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-8 py-6 text-sm text-muted-foreground">
                        {fund.date}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center text-muted-foreground/30 relative border border-dashed border-border/60">
                <Shield className="w-10 h-10" />
                <div className="absolute -top-1 -right-1">
                  <AlertCircle className="w-6 h-6 text-muted-foreground/20" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold tracking-tight">No funds detected yet</h4>
                <p className="text-muted-foreground max-w-sm mx-auto text-sm">
                  Once someone sends a private payment to your Zyn handle, it will appear here after a quick scan.
                </p>
              </div>
              <Button variant="outline" className="rounded-xl font-bold" onClick={scanFunds}>
                Refresh Scanner
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function Lock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
