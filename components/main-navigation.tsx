"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, FileText, Cpu, ChevronDown, ChevronRight } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MainNavigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  
  // Navigation items
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Invoices", href: "/invoices", icon: FileText }
  ]
  
  return (
    <div className="sticky top-0 z-50 bg-[#111827] py-3 px-4 border-b border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 border-r border-slate-800 bg-[#1e293b]">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Wash Masters</h2>
                    <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-slate-700">
                      <X className="h-5 w-5 text-slate-400" />
                    </button>
                  </div>
                </div>
                <nav className="flex-1 overflow-auto py-4">
                  <ul>
                    {navItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link 
                            href={item.href}
                            onClick={() => setOpen(false)} 
                            className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-300'}`}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                            {isActive ? (
                              <ChevronDown className="ml-auto h-4 w-4 opacity-60" />
                            ) : (
                              <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
                            )}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
                <div className="p-4 border-t border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      WM
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Admin User</p>
                      <p className="text-xs text-slate-400">admin@washmasters.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Wash Masters
          </Link>
        </div>
      </div>
    </div>
  )
}
