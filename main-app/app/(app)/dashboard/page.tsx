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
      <div className="flex items-center gap-1 sm:gap-2 mb-8 sm:mb-12 border-b border-border/40 w-full sm:w-fit overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('scan')}
          className={cn(
            "flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-8 py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex-1 sm:flex-none min-w-fit",
            activeTab === 'scan' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="whitespace-nowrap">Scanner</span>
          {activeTab === 'scan' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={cn(
            "flex items-center justify-center sm:justify-start gap-2 px-4 sm:px-8 py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all relative flex-1 sm:flex-none min-w-fit",
            activeTab === 'vault' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Fingerprint className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="whitespace-nowrap">Vault</span>
          {activeTab === 'vault' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'scan' ? <SweepDashboard /> : <IdentityDashboard />}
      </div>
    </div>
  )
}
