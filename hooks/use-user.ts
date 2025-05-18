"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useUser() {
  const [user, setUser] = useState<{
    email: string | null
    initials: string
    displayName: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      setLoading(true)
      
      const { data } = await supabase.auth.getSession()
      
      if (data.session?.user) {
        const email = data.session.user.email
        
        // Create display name and initials from email
        const displayName = email
          ? email.split('@')[0].split('.').map((part: string) => 
              part.charAt(0).toUpperCase() + part.slice(1)
            ).join(' ')
          : 'User'
          
        const initials = email
          ? email.split('@')[0].split(/[^a-zA-Z0-9]/).map((part: string) => 
              part.charAt(0).toUpperCase()
            ).slice(0, 2).join('')
          : 'U'
        
        setUser({ 
          email, 
          displayName,
          initials 
        })
      } else {
        setUser(null)
      }
      
      setLoading(false)
    }
    
    getUser()
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: any) => {
        if (session?.user) {
          const email = session.user.email
          
          // Create display name and initials from email
          const displayName = email
            ? email.split('@')[0].split('.').map((part: string) => 
                part.charAt(0).toUpperCase() + part.slice(1)
              ).join(' ')
            : 'User'
            
          const initials = email
            ? email.split('@')[0].split(/[^a-zA-Z0-9]/).map((part: string) => 
                part.charAt(0).toUpperCase()
              ).slice(0, 2).join('')
            : 'U'
          
          setUser({ 
            email, 
            displayName,
            initials 
          })
        } else {
          setUser(null)
        }
        
        setLoading(false)
      }
    )
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
