'use client'

import { useState } from 'react'
import { SweepDashboard } from '@/components/SweepDashboard'
import { IdentityDashboard } from '@/components/IdentityDashboard'
import { Shield, Fingerprint } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'vault'>('scan')

  return (
    <div className="w-full min-h-screen animate-in fade-in duration-700 px-6 sm:px-12 py-12">
      
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-12 border-b border-border/40 w-fit">
        <button
          onClick={() => setActiveTab('scan')}
          className={cn(
            "flex items-center gap-2 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
            activeTab === 'scan' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Shield className="w-4 h-4" />
          Private Scanner
          {activeTab === 'scan' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={cn(
            "flex items-center gap-2 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
            activeTab === 'vault' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Fingerprint className="w-4 h-4" />
          Identity Vault
          {activeTab === 'vault' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'scan' ? <SweepDashboard /> : <IdentityDashboard />}
      </div>
    </div>
  )
}
