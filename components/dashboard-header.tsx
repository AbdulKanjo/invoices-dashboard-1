"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { CalendarRange } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"

export function DashboardHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleDateRangeApply = (range: DateRange) => {
    if (!range.from || !range.to) return

    // Create new URLSearchParams
    const params = new URLSearchParams(searchParams.toString())

    // Format dates as YYYY-MM-DD
    const fromDate = format(range.from, "yyyy-MM-dd")
    const toDate = format(range.to, "yyyy-MM-dd")

    // Set the date parameters
    params.set("from", fromDate)
    params.set("to", toDate)

    // Update the URL with the new search parameters
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">Overview of your car wash business performance</p>
      </div>
      <div className="flex w-full items-center gap-2 md:w-auto">
        <CalendarRange className="h-4 w-4 text-slate-400" />
        <DateRangePicker onApply={handleDateRangeApply} />
      </div>
    </div>
  )
}
