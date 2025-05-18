import { NextResponse } from 'next/server'
import { forecastInventory } from '@/lib/server-actions'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      dateFrom = undefined,
      dateTo = undefined,
      location = undefined,
      category = undefined,
      locations = undefined,
      categories = undefined,
    } = body

    const locationParam = location || (Array.isArray(locations) && locations.length === 1 ? locations[0] : locations)
    const categoryParam = category || (Array.isArray(categories) && categories.length === 1 ? categories[0] : categories)

    const data = await forecastInventory({
      dateFrom,
      dateTo,
      location: locationParam,
      category: categoryParam,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Failed to forecast inventory' },
      { status: 500 }
    )
  }
}
