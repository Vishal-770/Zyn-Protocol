'use client'

import { Shield, Globe, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="w-full bg-card/30 border-t border-border/50 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Zyn Protocol
            </Link>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              The leading privacy layer for Ethereum identity. Receive payments through untraceable stealth addresses while maintaining your ENS handle.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <ExternalLink className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all">
                <MessageSquare className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs text-primary mb-6">Protocol</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><Link href="/pay" className="hover:text-foreground transition-colors">Send Payment</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Claim Name</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-xs text-primary mb-6">Resources</h4>
            <ul className="space-y-4 text-sm font-medium text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">EIP-5564</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Github</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
            © 2026 Zyn Protocol • Privacy by default
          </div>
          <div className="flex gap-8 text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
