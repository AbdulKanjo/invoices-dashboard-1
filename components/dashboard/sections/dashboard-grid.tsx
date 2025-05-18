import type React from "react"
import { Suspense } from "react"
import { ExpandableCard } from "@/components/expandable-card"
import { LocationCategoryHeatmap } from "@/components/location-category-heatmap"
import { SkuUsageHeatmap } from "@/components/sku-usage-heatmap"
import { TopSkusBySpend } from "@/components/top-skus-by-spend"
import { TopLaborCostsByInvoice } from "@/components/top-labor-costs-by-invoice"
import { ServiceHoursVisualization } from "@/components/service-hours-visualization"
import { MostExpensiveInvoices } from "@/components/most-expensive-invoices"

interface DashboardGridProps {
  dateFrom: string
  dateTo: string
}

function LoadingFallback() {
  return <div className="flex h-24 items-center justify-center">Loading...</div>
}

export function DashboardGrid({ dateFrom, dateTo }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardGridItem
        title="Which Locations Are Cost-Heavy in Each Category?"
        description="Heat map of expenses by location and category"
        component={<LocationCategoryHeatmap dateFrom={dateFrom} dateTo={dateTo} />}
      />

      <DashboardGridItem
        title="Usage Hot-Spots: Which SKUs We Consume the Most Per Site?"
        description="Heat map of quantity usage by location and SKU"
        component={<SkuUsageHeatmap dateFrom={dateFrom} dateTo={dateTo} />}
      />

      <DashboardGridItem
        title="Top 10 SKUs by Spend"
        description="Highest expense items this period"
        component={<TopSkusBySpend dateFrom={dateFrom} dateTo={dateTo} />}
      />

      <DashboardGridItem
        title="Top 10 Labor Costs by Invoice"
        description="Highest labor expenses by invoice"
        component={<TopLaborCostsByInvoice dateFrom={dateFrom} dateTo={dateTo} />}
      />

      <DashboardGridItem
        title="Service Hours by Location"
        description="Total service hours across all locations"
        component={<ServiceHoursVisualization dateFrom={dateFrom} dateTo={dateTo} />}
      />

      <DashboardGridItem
        title="'Most Expensive Invoices' Leaderboard"
        description="Top 20 invoices by total amount"
        component={<MostExpensiveInvoices dateFrom={dateFrom} dateTo={dateTo} />}
      />
    </div>
  )
}

interface DashboardGridItemProps {
  title: string
  description: string
  component: React.ReactNode
}

function DashboardGridItem({ title, description, component }: DashboardGridItemProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ExpandableCard title={title} description={description}>
        {component}
      </ExpandableCard>
    </Suspense>
  )
}
