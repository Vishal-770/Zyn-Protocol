'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletConnect } from "@/components/WalletConnect"
import { cn } from "@/lib/utils"
import { Shield, Menu, X, CreditCard, LayoutDashboard, Send } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

const navItems = [
  { name: "Pay", href: "/pay", icon: Send },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
]

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
            <div className="bg-primary p-1.5 rounded-lg shadow-sm">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Zyn<span className="text-muted-foreground/50 font-light">.eth</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all rounded-md hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "text-foreground bg-accent/50" : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <WalletConnect />
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="h-9 w-9 md:hidden" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>

            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-left mb-8">Navigation</SheetTitle>
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-lg font-medium rounded-lg transition-colors",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <div className="mt-4 pt-4 border-t sm:hidden">
                  <WalletConnect />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
