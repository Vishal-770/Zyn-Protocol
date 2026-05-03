'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { 
  Send, 
  LayoutDashboard,
  Key,
  ExternalLink,
  X
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Claim Identity', href: '/register', icon: Key },
  { name: 'Private Send', href: '/pay', icon: Send },
]

export function Sidebar({ collapsed, mobileOpen, onClose }: any) {
  const pathname = usePathname()

  return (
    <aside 
      className={cn(
        // Base styles
        "bg-background border-r border-border/40 flex flex-col transition-all duration-300 ease-in-out z-50",
        // Desktop styles
        "md:relative",
        collapsed ? "md:w-[72px]" : "md:w-64",
        // Mobile styles
        "fixed inset-y-0 left-0 w-64 md:translate-x-0 shadow-2xl md:shadow-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Branding Section */}
      <div className="h-20 flex items-center justify-between px-6 shrink-0 overflow-hidden">
        <div className={cn("flex items-center gap-3", (collapsed && !mobileOpen) && "md:mx-auto")}>
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <Image src="/logo.png" alt="Zyn" fill className="object-contain invert" />
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="font-black tracking-tighter text-xl uppercase whitespace-nowrap animate-in fade-in duration-300">
              Zyn
            </span>
          )}
        </div>

        {/* Mobile Close Button */}
        {mobileOpen && (
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {(!collapsed || mobileOpen) && (
          <div className="px-3 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            Internal
          </div>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              onClick={onClose} // Close on mobile navigation
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                (collapsed && !mobileOpen) && "md:justify-center"
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
              )}
              
              <Icon className={cn(
                "w-5 h-5 shrink-0 transition-colors", 
                isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
              )} />
              
              {(!collapsed || mobileOpen) && (
                <span className={cn("text-sm font-semibold tracking-tight whitespace-nowrap", isActive ? "font-bold" : "font-medium")}>
                  {item.name}
                </span>
              )}

              {/* Tooltip (Desktop Only) */}
              {(collapsed && !mobileOpen) && (
                <div className="hidden md:block absolute left-16 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider z-50 whitespace-nowrap shadow-xl">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto border-t border-border/40 p-3">
        <a 
          href="https://github.com/Vishal-770/Zyn-Protocol" 
          target="_blank"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group",
            (collapsed && !mobileOpen) && "md:justify-center"
          )}
        >
          <ExternalLink className="w-4 h-4 shrink-0 opacity-40 group-hover:opacity-100" />
          {(!collapsed || mobileOpen) && <span className="text-sm font-semibold tracking-tight whitespace-nowrap">Docs</span>}
        </a>
      </div>
    </aside>
  )
}
