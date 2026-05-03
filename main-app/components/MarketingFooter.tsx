'use client'

import { Globe, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function MarketingFooter() {
  return (
    <footer className="w-full bg-background border-t border-border/40 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
                <Image src="/logo.png" alt="Zyn" fill className="object-contain" />
              </div>
              <span className="text-xl font-black uppercase italic tracking-tighter">Zyn Protocol</span>
            </Link>
            <p className="text-muted-foreground/60 max-w-sm leading-relaxed italic font-medium">
              The industry standard for Ethereum identity privacy. Zero-Link architecture for a stateless, unlinked history.
            </p>
            <div className="flex gap-6">
              {[Globe, ExternalLink, MessageSquare].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border border-border/40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-500">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black uppercase tracking-[0.4em] text-[10px] text-primary mb-8 italic">Protocol</h4>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/pay" className="hover:text-primary transition-colors">Transactions</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Identity</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase tracking-[0.4em] text-[10px] text-primary mb-8 italic">Resources</h4>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
              <li><Link href="/docs" className="hover:text-primary transition-colors">Technical Docs</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">EIP-5564 Spec</a></li>
              <li><a href="https://github.com/Vishal-770/Zyn-Protocol" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Github Source</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">
            © 2026 Zyn Protocol • Decoupled Identity Architecture
          </div>
          <div className="flex gap-10 text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Audit</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
