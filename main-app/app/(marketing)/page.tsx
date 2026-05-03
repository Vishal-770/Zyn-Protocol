'use client'

import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Layers, Network, Fingerprint, Cpu, Lock, ChevronRight, Zap, ArrowRight, Terminal, EyeOff, ShieldAlert, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugin globally
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Professional Kinetic Split Text
function SplitText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <div className={`overflow-hidden flex flex-wrap gap-x-[0.2em] ${className}`}>
      {children.split(" ").map((word, i) => (
        <span key={i} className="split-word inline-block will-change-transform">
          {word}
        </span>
      ))}
    </div>
  )
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!mounted || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. LOADER DISMISSAL
      const loaderTl = gsap.timeline()
      loaderTl.to(".loader-bar", { width: "100%", duration: 0.8, ease: "power2.inOut" })
      .to(loaderRef.current, { yPercent: -100, duration: 1, ease: "expo.inOut" })

      // 2. HERO ENTRANCE
      const heroTl = gsap.timeline({ delay: 1 })
      heroTl.from(".split-word", {
        y: 120,
        rotateX: -40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.05,
        ease: "power4.out"
      })
      .from(".hero-subtext", { opacity: 0, y: 20, duration: 1 }, "-=0.8")
      .from(".hero-cta", { opacity: 0, y: 20, stagger: 0.1, duration: 0.8 }, "-=0.6")

      // 3. SHADOW PROTOCOL (Pinned Storytelling with Precision Snapping)
      // Only pin and snap on desktop/tablet (768px+)
      const isDesktop = window.innerWidth >= 1024
      const pinTrigger = document.querySelector(".pin-trigger")
      if (pinTrigger && isDesktop) {
        ScrollTrigger.create({
          trigger: pinTrigger,
          start: "top top",
          end: "bottom bottom",
          pin: ".pin-visual-wrap",
          pinSpacing: false,
          scrub: 1,
          snap: {
            snapTo: 1 / 2,
            duration: { min: 0.2, max: 0.5 },
            delay: 0.1,
            ease: "power2.inOut"
          }
        })

        const items = gsap.utils.toArray<HTMLElement>(".pin-step")
        items.forEach((item, i) => {
          gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top 60%",
              end: "top 40%",
              scrub: true,
              onEnter: () => {
                gsap.to(".pin-visual-core", { 
                  borderColor: i === 0 ? "var(--primary)" : i === 1 ? "#3b82f6" : "#10b981",
                  duration: 0.5 
                })
              }
            }
          })
          .from(item, { opacity: 0, x: -40, duration: 1 })
          .to(item, { opacity: 1, duration: 1 })
        })
      }

      // 4. KINETIC FEATURE STREAM (Horizontal Pin)
      const featureStream = document.querySelector(".feature-stream")
      if (featureStream) {
        const track = document.querySelector(".feature-track") as HTMLElement;
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + (isDesktop ? 100 : 40)),
          ease: "none",
          scrollTrigger: {
            trigger: ".feature-stream",
            start: "top top",
            end: () => `+=${track.scrollWidth}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          }
        })
      }

      // 5. INFRASTRUCTURE REVEALS
      const sections = gsap.utils.toArray<HTMLElement>(".reveal-group")
      sections.forEach((section) => {
        const elements = (section as HTMLElement).querySelectorAll(".reveal-el")
        gsap.from(elements, {
          y: 50,
          opacity: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section as HTMLElement,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        })
      })

    }, containerRef)

    return () => ctx.revert()
  }, [mounted])

  if (!mounted) return null

  return (
    <main ref={containerRef} className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden relative">
      
      {/* ── LOADER ── */}
      <div ref={loaderRef} className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 invert opacity-80">
            <Image src="/logo.png" alt="Zyn" fill sizes="(max-width: 768px) 48px, 64px" className="object-contain" />
          </div>
          <div className="w-32 sm:w-48 h-[1px] bg-white/10">
            <div className="loader-bar h-full w-0 bg-primary" />
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero-section relative min-h-screen flex flex-col justify-center px-6 lg:px-20 overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="parallax-img absolute -inset-x-0 -top-[10%] -bottom-[10%] sm:-top-[20%] sm:-bottom-[20%] scale-150 sm:scale-125">
            <Image 
              src="/hero-abstract.png" 
              alt="" 
              fill 
              sizes="100vw"
              className="object-cover opacity-[0.05] dark:opacity-10 grayscale brightness-125 dark:brightness-100"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-5xl space-y-8 sm:space-y-10">
            <div className="hero-cta inline-flex items-center gap-4 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-[0.5em] sm:tracking-[0.8em] border-l-2 border-primary pl-4 sm:pl-6 py-2 bg-primary/5">
              Protocol v1.1.0 • Stable
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-[9rem] font-black tracking-tighter leading-[0.9] sm:leading-[0.8] uppercase italic text-foreground">
              <SplitText>PRIVACY REFACTORED.</SplitText>
              <div className="text-primary not-italic mt-2 overflow-hidden">
                <span className="split-word inline-block">STATELESS.</span>
              </div>
            </h1>
            
            <p className="hero-subtext text-lg sm:text-2xl lg:text-3xl text-muted-foreground/60 font-medium leading-tight max-w-3xl italic border-l border-border/20 pl-6 sm:pl-12 py-3 sm:py-4">
              Zero-Link architecture for high-integrity redirection.
            </p>

            <div className="hero-cta flex flex-wrap gap-4 sm:gap-8 pt-4 sm:pt-6">
              <Button size="lg" className="h-16 sm:h-20 px-8 sm:px-16 rounded-none font-black uppercase tracking-[0.4em] text-[9px] sm:text-[10px] bg-foreground text-background hover:bg-primary transition-all group" asChild>
                <Link href="/register">Initialize <ArrowRight className="ml-2 sm:ml-4 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-2 transition-transform" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="h-16 sm:h-20 px-8 sm:px-16 rounded-none font-black uppercase tracking-[0.4em] text-[9px] sm:text-[10px] border-2 border-border/20 dark:border-border/40 hover:border-primary transition-all bg-transparent" asChild>
                <Link href="/pay">Execute Transfer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHADOW PROTOCOL (Pinned Storytelling) ── */}
      <section className="pin-trigger relative min-h-screen lg:min-h-[250vh] bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-20 lg:space-y-[30vh] py-20 lg:py-[20vh] lg:pb-[60vh]">
            <div className="pin-step space-y-6">
              <EyeOff className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none">
                Ownership <br/> <span className="text-primary not-italic">Decoupled.</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/40 font-medium italic border-l-4 border-primary pl-6 sm:pl-8">
                Routes every payment through a temporary cryptographic shadow.
              </p>
            </div>
            
            <div className="pin-step space-y-6">
              <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none">
                Identity <br/> <span className="text-primary not-italic">Shielded.</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/40 font-medium italic border-l-4 border-primary pl-6 sm:pl-8">
                Stealth addresses ensure no third party can track fund flow.
              </p>
            </div>

            <div className="pin-step space-y-6">
              <Network className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none">
                Resolution <br/> <span className="text-primary not-italic">Resilient.</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-white/40 font-medium italic border-l-4 border-primary pl-6 sm:pl-8">
                Stateless resolution means metadata is never stored.
              </p>
            </div>
          </div>

          <div className="pin-visual-wrap relative hidden lg:block">
            <div className="h-screen flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square border border-white/10 bg-white/5 flex flex-col items-center justify-center p-12 gap-8 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <Image src="/hero-abstract.png" alt="" fill className="object-cover grayscale" />
                </div>
                <div className="pin-visual-core w-32 h-32 border-4 border-primary rounded-full flex items-center justify-center animate-pulse transition-colors duration-500">
                  <Lock className="w-12 h-12 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-[1em] text-primary">SECURE_SYNC</p>
                  <p className="text-[10px] font-black italic opacity-40 uppercase">Establishing Protocol...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE STREAM (Pinned Horizontal) ── */}
      <section className="feature-stream relative bg-background overflow-hidden border-t border-border/10">
        <div className="py-16 sm:py-24 flex flex-col justify-center overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-20 mb-12 sm:mb-16 w-full">
            <div className="flex items-start gap-4 sm:gap-6 mb-12 sm:mb-16">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary mt-1" />
              <div className="space-y-4">
                <h2 className="text-4xl sm:text-5xl font-black uppercase italic tracking-tighter leading-none text-foreground">
                  Protocol <br/> <span className="text-primary not-italic">Capacities.</span>
                </h2>
                <div className="w-16 h-1 bg-primary" />
              </div>
            </div>
          </div>
          
          <div className="feature-track flex gap-6 sm:gap-12 whitespace-nowrap px-6 lg:px-20 will-change-transform">
            {[
              { id: "01", title: "Redirection Layer", desc: "Decouple wallet history from public metadata." },
              { id: "02", title: "Stealth Generation", desc: "EIP-5564 compliant addresses." },
              { id: "03", title: "Zero-Link Transfers", desc: "Stateless asset movement." },
              { id: "04", title: "Identity Shielding", desc: "Local-only encryption." },
              { id: "05", title: "Ephemeral Nodes", desc: "Temporary resolution." },
              { id: "06", title: "Hardened Vaults", desc: "Stealth key security." }
            ].map((f, i) => (
              <div key={i} className="inline-flex flex-col justify-between p-8 sm:p-12 border border-border/10 bg-muted/5 min-w-[300px] sm:min-w-[500px] aspect-[4/3] sm:aspect-video">
                <div className="flex justify-between items-start">
                   <span className="text-2xl sm:text-4xl font-black italic opacity-20 text-primary">{f.id}</span>
                   <ShieldCheck className="w-5 h-5 sm:w-8 sm:h-8 text-primary/40" />
                </div>
                <div className="space-y-2 sm:space-y-4 text-left">
                  <h3 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter text-foreground whitespace-normal">{f.title}</h3>
                  <p className="text-sm sm:text-lg text-muted-foreground/60 font-medium italic leading-relaxed whitespace-normal max-w-xs">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INFRASTRUCTURE GRID ── */}
      <section className="reveal-group py-20 sm:py-32 px-6 lg:px-20 max-w-7xl mx-auto space-y-16 sm:space-y-24 border-t border-border/10">
        <div className="reveal-el space-y-6 text-center">
          <h2 className="text-4xl sm:text-7xl font-black uppercase italic tracking-tighter leading-none text-foreground">
            Hardened <br/> <span className="text-primary not-italic">Infrastructure.</span>
          </h2>
          <div className="w-16 sm:w-20 h-1 sm:h-1.5 bg-primary mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/10 dark:bg-border/20 border border-border/10 dark:border-border/20">
          {[
            { title: "Zero-Link", desc: "Decoupling wallet identity from metadata.", icon: <Layers className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { title: "CCIP-Read", desc: "Native ENS resolution to stealth addresses.", icon: <Network className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { title: "Self-Custody", desc: "Local encryption of viewing keys.", icon: <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6" /> },
            { title: "Gas-Light", desc: "Minimal transaction overhead.", icon: <Cpu className="w-5 h-5 sm:w-6 sm:h-6" /> }
          ].map((feature, i) => (
            <div key={i} className="reveal-el p-8 sm:p-10 bg-background space-y-6 sm:space-y-8 group hover:bg-muted/5 transition-colors">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-border/20 text-muted-foreground group-hover:text-primary group-hover:border-primary transition-colors">
                {feature.icon}
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-foreground">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground/60 font-medium italic leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="reveal-group py-24 sm:py-40 px-6 border-t border-border/10 dark:border-border/20 text-center">
        <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12">
          <div className="reveal-el space-y-4 sm:space-y-6">
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none text-foreground">
              Forge Your <br/>
              <span className="text-primary not-italic">Identity.</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground/60 font-medium italic max-w-xl mx-auto px-4">
              Ready to claim your private identity? Take command of your cryptographic history.
            </p>
          </div>
          
          <div className="reveal-el pt-4 sm:pt-6">
            <Button size="lg" className="h-16 sm:h-20 w-full sm:w-auto px-12 sm:px-20 rounded-none font-black uppercase tracking-[0.4em] text-[10px] sm:text-[11px] bg-foreground text-background hover:bg-primary shadow-xl shadow-primary/10 transition-all group" asChild>
              <Link href="/register">
                Initialize Registration <ArrowRight className="ml-4 w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  )
}
