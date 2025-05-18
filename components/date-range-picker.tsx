"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  onApply?: (range: DateRange) => void
  defaultFrom?: string
  defaultTo?: string
}


export function DateRangePicker({ className, onApply, defaultFrom, defaultTo, ...props }: DateRangePickerProps) {
  function parseLocalDate(dateStr?: string) {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    let from = defaultFrom ? parseLocalDate(defaultFrom) : new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1);
    let to = defaultTo ? parseLocalDate(defaultTo) : new Date();
    return { from, to };
  });

  React.useEffect(() => {
    if (defaultFrom && defaultTo) {
      setDate({ from: parseLocalDate(defaultFrom), to: parseLocalDate(defaultTo) });
    } else if (defaultFrom) {
      setDate({ from: parseLocalDate(defaultFrom), to: new Date() });
    } else if (defaultTo) {
      setDate({ from: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 1), to: parseLocalDate(defaultTo) });
    }
  }, [defaultFrom, defaultTo]);
  const [isOpen, setIsOpen] = React.useState(false)

  const handleApply = () => {
    if (date && onApply) {
      onApply(date)
    }
    setIsOpen(false)
  }

  const handlePresetApply = (preset: { getValue: () => DateRange }) => {
    const range = preset.getValue()
    setDate(range)
    handleApply()
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start bg-slate-800 border-slate-700 text-left font-normal text-slate-200 h-10",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          {/* Single calendar for selecting date range */}
          <div>
            <div className="p-3 border-b border-slate-800 bg-slate-900">
              <p className="text-center text-sm text-slate-300 font-medium">
                Date
              </p>
              <p className="text-center text-xs text-slate-400 mt-1">
                Click once for start date, click again for end date
              </p>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
              className="p-2 bg-[#111827]"
              showWeekNumber={false}
              classNames={{
                head_row: "hidden",
                table: "w-full max-w-[280px] mx-auto",
                month: "space-y-4 bg-[#111827]",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-slate-200",
                cell: "h-8 w-8 p-0 relative text-slate-200 [&:has([aria-selected])]:bg-emerald-600/20 [&:has([aria-selected.day-range-middle])]:bg-emerald-500/15 [&:has([aria-selected])]:text-emerald-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                day: "h-8 w-8 p-0 text-sm aria-selected:opacity-100 hover:bg-slate-800/50 aria-selected:bg-transparent aria-selected:text-white"
              }}
            />
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-800 p-3 bg-slate-900">
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-100 font-medium border border-emerald-500/20" size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
