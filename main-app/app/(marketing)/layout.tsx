'use client'

import { useLayoutEffect } from "react";
import { MarketingNavbar } from "../../components/MarketingNavbar";
import { MarketingFooter } from "../../components/MarketingFooter";
import { Toaster } from "@/components/ui/sonner";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function MarketingLayout({
  children,
}: any) {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <MarketingNavbar />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
