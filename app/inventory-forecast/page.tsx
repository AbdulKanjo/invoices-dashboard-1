"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRequireAuth } from "@/hooks/use-auth"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ForecastItem {
  sku: string
  description: string
  avgDaysBetween: number | null
  purchaseCount: number
  lastPurchaseDate: string | null
  nextReplenishmentDate: string | null
}

export default function InventoryForecastPage() {
  const authLoading = useRequireAuth()
  const [data, setData] = useState<ForecastItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/inventory/forecast", { method: "POST", body: JSON.stringify({}) })
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Error loading forecast", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (authLoading) return null

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-6 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Inventory Forecast</h1>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow>
                <TableHead className="text-slate-300">SKU</TableHead>
                <TableHead className="text-slate-300">Description</TableHead>
                <TableHead className="text-slate-300">Next Replenishment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data.length ? (
                data.map((item, idx) => (
                  <TableRow key={idx} className="border-slate-800">
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.nextReplenishmentDate || "N/A"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div>
          <Link href="/dashboard" className="text-emerald-400 hover:underline">&larr; Back to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
