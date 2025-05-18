"use client"
import { Suspense } from "react"
import { useRequireAuth } from "@/hooks/use-auth"
import { InvoicesHeader } from "@/components/invoices-header"
import { InvoiceLinesTable } from "@/components/invoice-lines-table"

export default function InvoicesPage() {
  const loading = useRequireAuth()
  if (loading) return null
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <Suspense fallback={
          <div className="space-y-4">
            <div className="p-6 rounded-lg border border-slate-800 bg-slate-900">
              <div className="flex justify-between items-center">
                <div className="space-y-3">
                  <div className="h-5 w-48 bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-9 w-64 bg-slate-800 rounded animate-pulse"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 w-32 bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-10 w-32 bg-slate-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        }>
          <InvoicesHeader />
        </Suspense>
        <Suspense fallback={
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <div className="flex flex-col space-y-4">
              <div className="h-8 w-full bg-slate-800 rounded animate-pulse"></div>
              <div className="grid grid-cols-1 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 w-full bg-slate-800 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        }>
          <InvoiceLinesTable />
        </Suspense>
      </div>
    </div>
  )
}
