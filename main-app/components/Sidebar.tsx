'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Shield, 
  Send, 
  Inbox, 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard,
  Key,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Claim Identity', href: '/register', icon: Key },
  { name: 'Private Send', href: '/pay', icon: Send },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside 
      className={cn(
        "bg-background border-r border-border/40 flex flex-col transition-all duration-300 ease-in-out relative z-40",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Branding Section */}
      <div className="h-20 flex items-center px-6 mb-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center text-background shrink-0 shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="font-black tracking-tighter text-xl uppercase">Zyn</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <div className={cn("px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50", collapsed && "hidden")}>
          Protocol
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              {/* Active Accent Line */}
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
              )}
              
              <Icon className={cn(
                "w-5 h-5 shrink-0 transition-colors", 
                isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
              )} />
              
              {!collapsed && (
                <span className={cn("text-sm font-semibold tracking-tight", isActive ? "font-bold" : "font-medium")}>
                  {item.name}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-16 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1">
        <a 
          href="https://github.com/Vishal-770/Zyn-Protocol" 
          target="_blank"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group",
            collapsed && "justify-center"
          )}
        >
          <ExternalLink className="w-5 h-5 shrink-0 opacity-40 group-hover:opacity-100" />
          {!collapsed && <span className="text-sm font-medium">Documentation</span>}
        </a>
        
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start gap-3 px-3 rounded-lg font-bold text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 h-11",
            collapsed && "justify-center"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold">Collapse View</span>
            </>
          )}
        </Button>
      </div>

      {/* Subtle Bottom Border Overlay for Depth */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border/20 to-transparent" />
    </aside>
  )
}
