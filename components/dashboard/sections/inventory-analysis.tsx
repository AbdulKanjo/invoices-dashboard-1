import { Suspense } from "react"
import { TopSkusBySpend } from "@/components/top-skus-by-spend"
import { SkuUsageHeatmap } from "@/components/sku-usage-heatmap"
import { LoadingFallback } from "@/components/dashboard/ui/loading-fallback"

interface InventoryAnalysisProps {
  dateFrom: string
  dateTo: string
}

export function InventoryAnalysis({ dateFrom, dateTo }: InventoryAnalysisProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Inventory Analysis</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<LoadingFallback />}>
          <TopSkusBySpend dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>

        <Suspense fallback={<LoadingFallback />}>
          <SkuUsageHeatmap dateFrom={dateFrom} dateTo={dateTo} />
        </Suspense>
      </div>
    </div>
  )
}
