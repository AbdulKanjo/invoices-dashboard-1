"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { CalendarRange, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear } from "date-fns"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectLabel,
  SelectGroup
} from "@/components/ui/select"

interface UniversalFilterBarProps {
  defaultDateFrom: string
  defaultDateTo: string
}

// Preset date ranges
const datePresets = [
  { label: "Last 7 Days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 Days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This Month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  {
    label: "Last Month",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1)
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) }
    },
  },
  { label: "This Year", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
  { label: "Last 3 Months", getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
  { label: "Last 6 Months", getValue: () => ({ from: subMonths(new Date(), 6), to: new Date() }) },
]

export function UniversalFilterBar({ defaultDateFrom, defaultDateTo }: UniversalFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Always expanded, button removed per request
  // Set default to 'This Month' unless URL params override
  const [activePreset, setActivePreset] = useState<string | null>("This Month");


  // Memoize the applyFilters function to prevent recreating it on every render
  const applyFilters = useCallback(
    ({ from, to }: { from: string; to: string }) => {
      // Create new URLSearchParams
      const params = new URLSearchParams(searchParams.toString())

      // Add date parameters
      params.set("from", from)
      params.set("to", to)

      // Add a timestamp to force data refresh
      params.set("_t", Date.now().toString())

      // Update the URL with the new search parameters
      router.push(`/dashboard?${params.toString()}`)
    },
    [router, searchParams],
  )

  const handleDateRangeApply = useCallback(
    (range: DateRange) => {
      if (!range.from || !range.to) return

      setActivePreset(null) // Clear active preset when custom date is selected

      applyFilters({
        from: format(range.from, "yyyy-MM-dd"),
        to: format(range.to, "yyyy-MM-dd"),
      })
    },
    [applyFilters],
  )

  const handlePresetClick = useCallback(
    (preset: (typeof datePresets)[0]) => {
      const range = preset.getValue()
      if (!range.from || !range.to) return

      setActivePreset(preset.label)

      applyFilters({
        from: format(range.from, "yyyy-MM-dd"),
        to: format(range.to, "yyyy-MM-dd"),
      })
    },
    [applyFilters],
  )

  // Initialize with the current URL parameters
  useEffect(() => {
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")
    
    // Always check if the current URL parameters match any preset
    if (fromParam && toParam) {
      // First, check if current date range matches any preset
      let matchedPreset = false;
      for (const preset of datePresets) {
        const presetRange = preset.getValue()
        if (
          format(presetRange.from, "yyyy-MM-dd") === fromParam && 
          format(presetRange.to, "yyyy-MM-dd") === toParam
        ) {
          setActivePreset(preset.label)
          matchedPreset = true;
          break
        }
      }
      
      // If no preset matches, it's a custom range
      if (!matchedPreset) {
        setActivePreset(null)
      }
    } else {
      // No date in URL, set default to 'This Month'
      setActivePreset("This Month");
      const preset = datePresets.find((p) => p.label === "This Month");
      if (preset) {
        const range = preset.getValue();
        applyFilters({
          from: format(range.from, "yyyy-MM-dd"),
          to: format(range.to, "yyyy-MM-dd"),
        });
      }
    }
  }, [searchParams, applyFilters])

  return (
    <div className="sticky top-0 z-50 bg-[#111827] pb-3 pt-3">
      <Card className="bg-[#1e293b] border-slate-700 p-4 shadow-sm rounded-lg">
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-white opacity-80" />
            <h2 className="text-base font-medium text-white">Date</h2>
          </div>
        </div>

        <div className="space-y-3">
          {/* Date label removed as requested */}

            <div className="flex items-center gap-2">
              {/* Dropdown for date presets and custom */}
              <Select
                value={activePreset || "custom"}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setActivePreset(null);
                  } else {
                    const preset = datePresets.find((p) => p.label === value);
                    if (preset) handlePresetClick(preset);
                  }
                }}
              >
                <SelectTrigger className="w-64 bg-slate-800/30 border border-slate-600/50 text-white text-sm shadow-none hover:border-slate-500 focus:border-white focus:ring-0 transition-colors rounded-md">
                  <CalendarRange className="mr-2 h-4 w-4 text-white opacity-70" />
                  <SelectValue placeholder="Select Date Range" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border border-slate-600/50 text-white rounded-md shadow-md">
                  <SelectGroup>
                    <SelectLabel className="text-xs text-slate-400 px-2 pt-2 pb-1 tracking-wide uppercase">Presets</SelectLabel>
                    {datePresets.map((preset) => (
                      <SelectItem key={preset.label} value={preset.label} className={activePreset === preset.label ? "bg-slate-700 text-white font-medium" : "hover:bg-slate-700/50"}>
                        <CalendarRange className="inline-block mr-2 h-4 w-4 text-white opacity-70 align-text-bottom" />
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator className="bg-slate-600/50 my-1" />
                  <SelectGroup>
                    <SelectLabel className="text-xs text-slate-400 px-2 pt-2 pb-1 tracking-wide uppercase">Custom</SelectLabel>
                    <SelectItem value="custom" className="hover:bg-slate-700/50">
                      <span className="inline-flex items-center">
                        <CalendarRange className="mr-2 h-4 w-4 text-white opacity-70" />
                        Custom Range...
                      </span>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Show custom date range picker if not using a preset */}
            {activePreset === null && (
              <div className="pt-3 mt-2 border-t border-slate-600/30">
                <div className="bg-slate-800/30 p-2 rounded-md">
                  <DateRangePicker onApply={handleDateRangeApply} />
                </div>
              </div>
            )}
          </div>
      </Card>
    </div>
  )
}
