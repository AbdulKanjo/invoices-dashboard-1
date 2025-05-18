"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <Button 
      onClick={handleLogout}
      variant="ghost"
      size="icon"
      className="fixed top-4 right-4 z-50 rounded-full hover:bg-slate-800"
      title="Logout"
    >
      <LogOut className="h-5 w-5 text-slate-300" />
    </Button>
  )
}
