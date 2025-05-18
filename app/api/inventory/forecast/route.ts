import { NextResponse } from 'next/server'
import { forecastSkuDemand } from '@/lib/server-actions'

export async function POST(request: Request) {
  try {
    const { sku } = await request.json()
    if (!sku) {
      return NextResponse.json({ error: 'SKU required' }, { status: 400 })
    }
    const result = await forecastSkuDemand(sku)
    return NextResponse.json({ forecast: result })
  } catch (err) {
    console.error('Forecast API error:', err)
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 })
  }
}
