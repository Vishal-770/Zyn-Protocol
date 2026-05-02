import Link from "next/link"
import { Shield, Globe, Code2, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold tracking-tight">Zyn.eth</span>
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              The next generation of private Web3 payments. Built on stealth address technology and ENS for a seamless, untraceable experience.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors">
                <Code2 className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-6">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/pay" className="text-muted-foreground hover:text-primary transition-colors">Send Payment</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-6">Protocol</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="#" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                  Smart Contracts <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Zyn.eth. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-foreground transition-colors">Security</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Status</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
