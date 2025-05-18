"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  MessageSquare,
  FileSpreadsheet,
  Droplets,
  Menu,
  X,
  MapPin,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { fetchAllLocations } from "@/lib/server-actions"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [isLocationsOpen, setIsLocationsOpen] = useState(false)
  const [locations, setLocations] = useState<string[]>([])
  const pathname = usePathname()

  useEffect(() => {
    async function loadLocations() {
      try {
        const locationsData = await fetchAllLocations()
        setLocations(locationsData)
      } catch (error) {
        console.error("Error loading locations:", error)
      }
    }

    loadLocations()
  }, [])

  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
    },
    {
      name: "Invoices",
      href: "/invoices",
      icon: FileSpreadsheet,
    },
    {
      name: "AI",
      href: "/ai",
      icon: MessageSquare,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-emerald-500" />
          <span className="text-xl font-bold text-white">Wash Masters</span>
        </div>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-400">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent side="left" className="border-r border-slate-800 bg-slate-950 p-0">
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold text-white">Wash Masters</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5 text-slate-400" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <nav className="space-y-1 p-4">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-slate-800 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}

          {/* Locations submenu */}
          <Collapsible open={isLocationsOpen} onOpenChange={setIsLocationsOpen} className="mt-4">
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5" />
                <span>Locations</span>
              </div>
              {isLocationsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-8 pt-1">
              {locations.map((location) => {
                const locationSlug = `/location/${encodeURIComponent(location.toLowerCase().replace(/\s+/g, "-"))}`
                return (
                  <Link
                    key={location}
                    href={locationSlug}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === locationSlug
                        ? "bg-slate-800 text-emerald-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white",
                    )}
                  >
                    {location}
                  </Link>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
