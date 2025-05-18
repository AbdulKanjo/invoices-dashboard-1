"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function InventoryForecastForm() {
  const [sku, setSku] = useState("")
  const [forecast, setForecast] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!sku) return
    setLoading(true)
    setForecast(null)
    try {
      const res = await fetch("/api/inventory/forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      })
      const data = await res.json()
      setForecast(data.forecast)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2 mt-2">
      <input
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        placeholder="Enter SKU"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
      />
      <Button onClick={handleSubmit} disabled={loading || !sku} className="w-full bg-slate-800 hover:bg-slate-700">
        {loading ? "Loading..." : "Get Forecast"}
      </Button>
      {forecast && (
        <pre className="whitespace-pre-wrap break-words text-sm text-slate-300 bg-slate-800 p-2 rounded-lg">
          {JSON.stringify(forecast, null, 2)}
        </pre>
      )}
    </div>
  )
}
