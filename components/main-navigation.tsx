"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Home, FileText, Cpu, ChevronDown, ChevronRight, User } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUser } from "@/hooks/use-user"

export function MainNavigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useUser()
  
  // Navigation items
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Invoices", href: "/invoices", icon: FileText },
    { label: "AI Assistant", href: "/ai", icon: Cpu }
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
                  <div className="flex items-center justify-center">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Wash Masters</h2>
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
                    {loading ? (
                      <div className="flex items-center gap-2 animate-pulse">
                        <div className="h-8 w-8 rounded-full bg-slate-700"></div>
                        <div className="space-y-1">
                          <div className="h-3 w-20 bg-slate-700 rounded"></div>
                          <div className="h-2 w-24 bg-slate-700 rounded"></div>
                        </div>
                      </div>
                    ) : user ? (
                      <>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {user.initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.displayName}</p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Not signed in</p>
                          <p className="text-xs text-slate-400">Please log in</p>
                        </div>
                      </div>
                    )}
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
