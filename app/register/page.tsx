"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { AuthInput } from "@/components/auth-input"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    router.push("/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm bg-slate-900 p-6 rounded-lg border border-slate-800">
        <h1 className="text-2xl font-bold text-center mb-2">Register</h1>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        <AuthInput
          type="email"
          defaultPlaceholder="Email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          required
        />
        <AuthInput
          type="password"
          defaultPlaceholder="Password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">Register</Button>
        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  )
}
