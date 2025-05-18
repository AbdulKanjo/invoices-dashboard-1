"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { fetchLocationCategoryHeatMap } from "@/lib/server-actions"
import { formatCurrency } from "@/lib/utils"
import { ExpandableComponent } from "@/components/expandable-component"
import { Card, CardContent } from "@/components/ui/card"

interface LocationCategoryHeatmapExpandableProps {
  dateFrom?: string
  dateTo?: string
  locations?: string[]
  categories?: string[]
}

export function LocationCategoryHeatmapExpandable({
  dateFrom,
  dateTo,
  locations,
  categories,
}: LocationCategoryHeatmapExpandableProps) {
  const router = useRouter()
  const [data, setData] = useState<Array<Record<string, any>>>([])
  const [availableCategories, setCategories] = useState<string[]>([])
  const [availableLocations, setLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [maxValue, setMaxValue] = useState(0)

  const handleCategoryClick = (location: string, category: string, dateFrom: string, dateTo: string) => {
    const searchParams = new URLSearchParams()
    searchParams.set('location', location)
    searchParams.set('category', category)
    searchParams.set('dateFrom', dateFrom)
    searchParams.set('dateTo', dateTo)
    router.push(`/invoices?${searchParams.toString()}`)
  }

  useEffect(() => {
    async function loadData() {
      try {
        const heatMapData = await fetchLocationCategoryHeatMap({
          dateFrom,
          dateTo,
          locations,
          categories,
        })

        setLocations(heatMapData.locations)
        setCategories(heatMapData.categories)
        setData(heatMapData.data)

        // Find the maximum value for color scaling
        let max = 0
        heatMapData.data.forEach((row) => {
          heatMapData.categories.forEach((category) => {
            if (row[category] > max) {
              max = row[category]
            }
          })
        })
        setMaxValue(max)
      } catch (error) {
        console.error("Error loading location-category heatmap:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [dateFrom, dateTo, locations, categories])

  // Function to get category color
  const getCategoryColor = (category: string): string => {
    const categoryLower = category.toLowerCase()
    if (categoryLower.includes("chemical")) return "bg-emerald-500"
    if (categoryLower.includes("equipment")) return "bg-amber-500"
    if (categoryLower.includes("labor")) return "bg-purple-500"
    return "bg-slate-500"
  }

  // Function to check if a category should be displayed
  const shouldDisplayCategory = (category: string): boolean => {
    const categoryLower = category.toLowerCase()
    return !categoryLower.includes("unclassified")
  }

  // Group data by location
  const groupedByLocation = data.reduce(
    (acc, row) => {
      const locationItems = []

      // Convert each category column into a separate item
      availableCategories.forEach((category) => {
        // Skip unclassified categories
        if (!shouldDisplayCategory(category)) return

        if (row[category] > 0) {
          locationItems.push({
            category,
            total: row[category],
          })
        }
      })

      // Sort categories by total (descending)
      locationItems.sort((a, b) => b.total - a.total)

      // Add to accumulator
      acc[row.location] = locationItems
      return acc
    },
    {} as Record<string, Array<{ category: string; total: number }>>,
  )

  // Add "All Locations" combined data
  const allLocationsData: Array<{ category: string; total: number }> = []

  // Combine data from all locations by category
  availableCategories.forEach((category) => {
    if (!shouldDisplayCategory(category)) return

    let categoryTotal = 0
    data.forEach((row) => {
      categoryTotal += row[category] || 0
    })

    if (categoryTotal > 0) {
      allLocationsData.push({
        category,
        total: categoryTotal,
      })
    }
  })

  // Sort the combined data by total (descending)
  allLocationsData.sort((a, b) => b.total - a.total)

  // Add the combined data to the groupedByLocation object
  if (allLocationsData.length > 0) {
    groupedByLocation["All Locations"] = allLocationsData
  }

  return (
    <ExpandableComponent
      title="Location Category Analysis"
      description="Expense distribution by location and category"
      fullWidth
    >
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded bg-slate-800"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {/* Render All Locations box first */}
          {groupedByLocation["All Locations"] && (
            <Card key="All Locations" className="bg-slate-800/50 border-slate-700/30 rounded-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">All Locations</h3>
                <div className="space-y-4">
                  {groupedByLocation["All Locations"].map((item) => {
                    const categoryColor = getCategoryColor(item.category)
                    return (
                      <div key={item.category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white text-lg">{item.category}</span>
                          <span className="text-white text-lg font-medium">{formatCurrency(item.total)}</span>
                        </div>
                        <div className={`h-1 w-full ${categoryColor}`}></div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Render individual location boxes */}
          {Object.entries(groupedByLocation)
            .filter(([location]) => location !== "All Locations")
            .map(([location, items]) => (
              <Card key={location} className="bg-slate-800/50 border-slate-700/30 rounded-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">{location}</h3>
                  <div className="space-y-4">
                    {items.map((item) => {
                      const categoryColor = getCategoryColor(item.category)
                      return (
                        <div key={item.category}>
                          <div className="flex justify-between items-center mb-1 cursor-pointer hover:opacity-80" 
                                onClick={() => handleCategoryClick(location, item.category, dateFrom || '', dateTo || '')}>
                            <span className="text-white text-lg">{item.category}</span>
                            <span className="text-white text-lg font-medium">{formatCurrency(item.total)}</span>
                          </div>
                          <div className={`h-1 w-full ${categoryColor}`}></div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </ExpandableComponent>
  )
}
