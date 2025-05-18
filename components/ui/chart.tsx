"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

type ChartConfig = Record<string, { label: string; color: string }>

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  return (
    <div
      className={cn("chart-container", className)}
      style={
        {
          "--color-chemical": config.chemical?.color,
          "--color-equipment": config.equipment?.color,
          "--color-location": config.location?.color,
          "--color-vendor": config.vendor?.color,
          "--color-cadence": config.cadence?.color,
          "--color-percentChange": config.percentChange?.color,
          "--color-fcf": config.fcf?.color,
          "--color-pv": config.pv?.color,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return <div className={cn("chart-tooltip", className)} {...props} />
}

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: Record<string, any> }>
  label?: string
}

// Update the ChartTooltipContent function to handle our new data formats
export function ChartTooltipContent({ active, payload, label, className, ...props }: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={cn("rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-md", className)} {...props}>
      <div className="grid gap-0.5">
        {label && <p className="text-xs font-medium text-slate-300">{label}</p>}
        {payload.map((item, index) => {
          if (!item) return null

          // Handle different data formats
          const name = item.name === "value" && item.payload ? item.payload.name : item.name
          const value = typeof item.value === "number" ? item.value : 0

          // Determine color based on name
          let color = "var(--color-chemical)"
          if (name === "equipment" || (name && name.includes && name.includes("Equipment"))) {
            color = "var(--color-equipment)"
          } else if (name === "location" || (name && name.includes && name.includes("Location"))) {
            color = "var(--color-location)"
          } else if (name === "vendor" || (item.payload && item.payload.name)) {
            color = "var(--color-vendor)"
          } else if (name === "cadence") {
            color = "var(--color-cadence)"
          } else if (name === "percentChange") {
            color = "var(--color-percentChange)"
          } else if (name === "fcf") {
            color = "var(--color-fcf)"
          } else if (name === "pv") {
            color = "var(--color-pv)"
          }

          return (
            <div key={index} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: color,
                  }}
                />
                <span className="text-xs font-medium capitalize text-slate-300">{name === "z" ? "Total" : name}</span>
              </div>
              <span className="text-xs font-medium text-slate-300">
                {name === "z" || name === "chemical" || name === "equipment" || name === "value"
                  ? `$${value.toLocaleString()}`
                  : value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const RechartsLegend = RechartsPrimitive.Legend

const RechartsLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}
    >
      {payload.map((item) => {
        return (
          <div
            key={item.value}
            className={cn("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground")}
          >
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: item.color,
              }}
            />
          </div>
        )
      })}
    </div>
  )
})
RechartsLegendContent.displayName = "RechartsLegendContent"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}

export { RechartsLegend as Chart }
