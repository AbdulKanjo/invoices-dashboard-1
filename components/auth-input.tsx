"use client"

import { useState, forwardRef, InputHTMLAttributes } from "react"
import { Input } from "@/components/ui/input"

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  defaultPlaceholder: string
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ defaultPlaceholder, className, ...props }, ref) => {
    const [placeholder, setPlaceholder] = useState(defaultPlaceholder)

    return (
      <Input
        {...props}
        ref={ref}
        placeholder={placeholder}
        className={`text-black ${className || ''}`}
        onFocus={() => setPlaceholder('')}
        onBlur={() => setPlaceholder(defaultPlaceholder)}
      />
    )
  }
)

AuthInput.displayName = "AuthInput"
