import type React from "react"
import { Droplets } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950 h-16 flex items-center px-6">
        <div className="flex items-center gap-2">
          <Droplets className="h-7 w-7 text-emerald-500" />
          <span className="text-xl font-bold text-white">Wash Masters</span>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-2 md:px-6 pb-16">{children}</main>
    </div>
  )
}
