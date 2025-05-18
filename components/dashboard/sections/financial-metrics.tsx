import { Suspense } from "react"
import { ExpandableCard } from "@/components/expandable-card"
import { MostExpensiveInvoices } from "@/components/most-expensive-invoices"
import { LoadingFallback } from "@/components/dashboard/ui/loading-fallback"

interface FinancialMetricsProps {
  dateFrom: string
  dateTo: string
}

export function FinancialMetrics({ dateFrom, dateTo }: FinancialMetricsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Financial Metrics</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-1 lg:grid-cols-1">
        <Suspense fallback={<LoadingFallback />}>
          <ExpandableCard title="'Most Expensive Invoices' Leaderboard" description="Top 20 invoices by total amount">
            <MostExpensiveInvoices dateFrom={dateFrom} dateTo={dateTo} />
          </ExpandableCard>
        </Suspense>
      </div>
    </div>
  )
}
