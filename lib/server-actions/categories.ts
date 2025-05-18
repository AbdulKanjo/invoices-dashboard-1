"use server"

import { supabase } from "@/lib/supabase"
import type { DateRangeFilter } from "./types"
import { applyDateFilter } from "./utils"

/**
 * Fetches all unique categories
 */
export async function fetchAllCategories() {
  const { data, error } = await supabase.from("invoice_lines").select("category").not("category", "ilike", "%ignore%")

  if (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Failed to fetch categories")
  }

  // Filter for unique categories in JavaScript
  const uniqueCategories = [...new Set(data.map((item) => item.category))]
  return uniqueCategories.sort()
}

/**
 * Fetches category spend trend data
 */
export async function fetchCategorySpendTrend({ dateFrom, dateTo }: DateRangeFilter = {}) {
  // First, get all invoices with date filtering
  let invoiceQuery = supabase.from("invoices").select("id, invoice_date")
  invoiceQuery = applyDateFilter(invoiceQuery, dateFrom, dateTo)

  const { data: invoices, error: invoiceError } = await invoiceQuery

  if (invoiceError) {
    console.error("Error fetching invoices:", invoiceError)
    throw new Error("Failed to fetch category spend trend")
  }

  // Get all invoice lines for these invoices
  const invoiceIds = invoices.map((invoice) => invoice.id)

  if (invoiceIds.length === 0) {
    return [] // No invoices found, return empty result
  }

  const { data: lines, error: linesError } = await supabase
    .from("invoice_lines")
    .select("invoice_id, category, line_total")
    .in("invoice_id", invoiceIds)
    .not("category", "ilike", "%ignore%") // Filter out ignore categories

  if (linesError) {
    console.error("Error fetching invoice lines:", linesError)
    throw new Error("Failed to fetch category spend trend")
  }

  // Create a map of invoice_id to invoice_date for easy lookup
  const invoiceDateMap = invoices.reduce(
    (map, invoice) => {
      if (invoice.invoice_date) {
        map[invoice.id] = invoice.invoice_date
      }
      return map
    },
    {} as Record<string, string>,
  )

  // Group by month and category
  const monthlySpend: Record<string, Record<string, number>> = {}

  lines.forEach((line) => {
    const invoiceDate = invoiceDateMap[line.invoice_id]

    // Skip if we can't find the invoice date
    if (!invoiceDate) return

    const month = invoiceDate.substring(0, 7) // YYYY-MM

    if (!monthlySpend[month]) {
      monthlySpend[month] = {}
    }

    if (!monthlySpend[month][line.category]) {
      monthlySpend[month][line.category] = 0
    }

    monthlySpend[month][line.category] += line.line_total
  })

  // Convert to array format for the chart
  const result = Object.entries(monthlySpend)
    .map(([month, categories]) => ({
      month,
      ...categories,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))

  return result
}

/**
 * Fetches category volatility data
 */
export async function fetchCategoryVolatility({ dateFrom, dateTo }: DateRangeFilter = {}) {
  try {
    // First, get all invoices with date filtering
    let invoiceQuery = supabase.from("invoices").select("id, invoice_date")
    invoiceQuery = applyDateFilter(invoiceQuery, dateFrom, dateTo)

    const { data: invoices, error: invoiceError } = await invoiceQuery

    if (invoiceError) {
      console.error("Error fetching invoices:", invoiceError)
      throw new Error("Failed to fetch category volatility")
    }

    // Get all invoice lines for these invoices
    const invoiceIds = invoices.map((invoice) => invoice.id)

    if (invoiceIds.length === 0) {
      return [] // No invoices found, return empty result
    }

    const { data: lines, error: linesError } = await supabase
      .from("invoice_lines")
      .select("invoice_id, category, line_total")
      .in("invoice_id", invoiceIds)
      .not("category", "ilike", "%ignore%") // Filter out ignore categories

    if (linesError) {
      console.error("Error fetching invoice lines:", linesError)
      throw new Error("Failed to fetch category volatility")
    }

    // Group by category
    const categoryTotals: Record<string, number[]> = {}

    lines.forEach((line) => {
      if (!categoryTotals[line.category]) {
        categoryTotals[line.category] = []
      }
      categoryTotals[line.category].push(line.line_total)
    })

    // Calculate statistics for each category
    const result = Object.entries(categoryTotals).map(([category, totals]) => {
      const sortedTotals = [...totals].sort((a, b) => a - b)
      const q1Index = Math.floor(sortedTotals.length / 4)
      const q3Index = Math.floor((sortedTotals.length * 3) / 4)

      const q1 = sortedTotals[q1Index]
      const q3 = sortedTotals[q3Index]
      const min = sortedTotals[0]
      const max = sortedTotals[sortedTotals.length - 1]

      const mean = totals.reduce((sum, value) => sum + value, 0) / totals.length

      const median =
        sortedTotals.length % 2 === 0
          ? (sortedTotals[sortedTotals.length / 2 - 1] + sortedTotals[sortedTotals.length / 2]) / 2
          : sortedTotals[Math.floor(sortedTotals.length / 2)]

      return {
        category,
        min,
        q1,
        median,
        q3,
        max,
        mean,
      }
    })

    return result
  } catch (error) {
    console.error("Error in fetchCategoryVolatility:", error)
    return []
  }
}
