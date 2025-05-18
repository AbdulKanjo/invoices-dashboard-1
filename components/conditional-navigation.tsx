"use client"

import { usePathname } from "next/navigation"
import { MainNavigation } from "@/components/main-navigation"

export function ConditionalNavigation() {
  const pathname = usePathname()
  const hideNavigation = pathname === '/login' || pathname === '/register'
  
  if (hideNavigation) {
    return null
  }
  
  return <MainNavigation />
}
