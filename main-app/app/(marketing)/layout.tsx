'use client'

import { MarketingNavbar } from "../../components/MarketingNavbar";
import { MarketingFooter } from "../../components/MarketingFooter";
import { Toaster } from "@/components/ui/sonner";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <MarketingNavbar />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
