import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ColumnVisibilityProvider } from "@/context/column-visibility-context"
import { ConditionalNavigation } from "@/components/conditional-navigation"
import "./globals.css"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Wash Masters Dashboard",
  description: "Business analytics dashboard for Wash Masters car wash",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-[#111827] text-white`}>
        <ConditionalNavigation />
        <ColumnVisibilityProvider>
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </ColumnVisibilityProvider>
      </body>
    </html>
  )
}
