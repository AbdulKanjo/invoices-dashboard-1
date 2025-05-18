"use client"

import type React from "react"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/sidebar"

interface MobileResponsiveWrapperProps {
  children: React.ReactNode
}

export function MobileResponsiveWrapper({ children }: MobileResponsiveWrapperProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile sidebar toggle */}
      <div className="flex md:hidden items-center justify-between border-b border-slate-800 p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="border-r border-slate-800 bg-slate-950 p-0">
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            {/* Render the sidebar content */}
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
