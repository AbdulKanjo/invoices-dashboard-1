import { Suspense } from "react"
import { ExpandableCard } from "@/components/expandable-card"
import { LocationCategoryHeatmap } from "@/components/location-category-heatmap"
import { ServiceHoursVisualization } from "@/components/service-hours-visualization"
import { TopLaborCostsByInvoice } from "@/components/top-labor-costs-by-invoice"
import { LoadingFallback } from "@/components/dashboard/ui/loading-fallback"

interface LocationAnalysisProps {
  dateFrom: string
  dateTo: string
}

export function LocationAnalysis({ dateFrom, dateTo }: LocationAnalysisProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Location Analysis</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<LoadingFallback />}>
          <ExpandableCard
            title="Which Locations Are Cost-Heavy in Each Category?"
            description="Heat map of expenses by location and category"
          >
            <LocationCategoryHeatmap dateFrom={dateFrom} dateTo={dateTo} />
          </ExpandableCard>
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <ExpandableCard title="Service Hours by Location" description="Total service hours across all locations">
            <ServiceHoursVisualization dateFrom={dateFrom} dateTo={dateTo} />
          </ExpandableCard>
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <ExpandableCard title="Top 10 Labor Costs by Invoice" description="Highest labor expenses by invoice">
            <TopLaborCostsByInvoice dateFrom={dateFrom} dateTo={dateTo} />
          </ExpandableCard>
        </Suspense>
      </div>
    </div>
  )
}
