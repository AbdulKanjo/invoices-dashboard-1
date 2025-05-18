"use server"

import { supabase } from "@/lib/supabase"
import type { InvoiceFilters } from "./types"
import { log } from "@/lib/logger"
import { applyDateFilter } from "./utils"

/**
 * Fetches invoice lines with filtering options
 */
export async function fetchInvoiceLinesByFilters(filters: InvoiceFilters) {
  log("fetchInvoiceLinesByFilters called with filters:", filters)
  
  try {
    // First, get the invoices matching our filters
    let invoiceQuery = supabase.from("invoices").select("id, invoice_date, invoice_number, source, location, pdf_url")
    
    // Order by invoice_date descending (newest first)
    invoiceQuery = invoiceQuery.order("invoice_date", { ascending: false })
    
    // Apply date filters
    if (filters.dateFrom) {
      invoiceQuery = invoiceQuery.gte("invoice_date", filters.dateFrom)
    }
    
    if (filters.dateTo) {
      invoiceQuery = invoiceQuery.lte("invoice_date", filters.dateTo)
    }
    
    // Apply location filter if provided
    if (filters.location && filters.location !== "All Locations") {
      invoiceQuery = invoiceQuery.ilike("location", `%${filters.location}%`)
    }
    
    // Execute the invoice query
    const { data: invoices, error: invoiceError } = await invoiceQuery
    
    if (invoiceError) {
      console.error("Error fetching invoices:", invoiceError)
      throw new Error("Failed to fetch invoices")
    }
    
    if (!invoices || invoices.length === 0) {
      log("No invoices found matching filters")
      return []
    }
    
    // Get all invoice IDs
    const invoiceIds = invoices.map(invoice => invoice.id)
    log(`Found ${invoiceIds.length} invoices matching filters, fetching line items`)
    
    // Now get the invoice lines for these invoices
    let linesQuery = supabase
      .from("invoice_lines")
      .select("*")
      .in("invoice_id", invoiceIds)
    
    // Apply category filter if provided
    if (filters.category && filters.category !== "All Categories") {
      linesQuery = linesQuery.ilike("category", `%${filters.category}%`)
    } else {
      // By default, filter out items with "ignore" category
      linesQuery = linesQuery.not("category", "ilike", "%ignore%")
    }
    
    // Apply limit if provided
    if (filters.limit) {
      const limitNum = parseInt(filters.limit, 10)
      if (!isNaN(limitNum)) {
        linesQuery = linesQuery.limit(limitNum)
      }
    }
    
    // Execute the lines query
    const { data: lines, error: linesError } = await linesQuery
    
    if (linesError) {
      console.error("Error fetching invoice lines:", linesError)
      throw new Error("Failed to fetch invoice lines")
    }
    
    if (!lines || lines.length === 0) {
      log("No invoice lines found matching filters")
      return []
    }
    
    // Create invoice ID to invoice map for easy lookup
    const invoiceMap = invoices.reduce((map, invoice) => {
      map[invoice.id] = invoice
      return map
    }, {})
    
    // Combine invoice data with each line item
    const combinedLines = lines.map(line => ({
      ...line,
      invoice_date: invoiceMap[line.invoice_id]?.invoice_date,
      invoice_number: invoiceMap[line.invoice_id]?.invoice_number,
      source: invoiceMap[line.invoice_id]?.source,
      location: invoiceMap[line.invoice_id]?.location,
      pdf_url: invoiceMap[line.invoice_id]?.pdf_url,
    }))
    
    // Final sort by date to ensure consistency after joining (newest first)
    const sortedLines = combinedLines.sort((a, b) => {
      // Convert to Date objects for proper comparison
      const dateA = new Date(a.invoice_date || '')
      const dateB = new Date(b.invoice_date || '')
      return dateB.getTime() - dateA.getTime() // Descending order (newest first)
    })
    
    log(`Returning ${sortedLines.length} invoice lines (sorted by date desc)`)
    
    // Return the sorted lines
    return sortedLines
    
  } catch (error) {
    console.error("Error in fetchInvoiceLinesByFilters:", error)
    return []
  }
}

/**
 * Fetches invoice lines for a specific SKU with filtering options
 */
export async function fetchInvoiceLinesBySkuAndFilters(filters: InvoiceFilters & { sku: string }) {
  log("fetchInvoiceLinesBySkuAndFilters called with filters:", filters)
  
  try {
    // First, get the invoices matching our date and location filters
    let invoiceQuery = supabase.from("invoices").select("id, invoice_date, invoice_number, source, location, pdf_url")
    
    // Order by invoice_date descending (newest first)
    invoiceQuery = invoiceQuery.order("invoice_date", { ascending: false })
    
    // Apply date filters
    if (filters.dateFrom) {
      invoiceQuery = invoiceQuery.gte("invoice_date", filters.dateFrom)
    }
    
    if (filters.dateTo) {
      invoiceQuery = invoiceQuery.lte("invoice_date", filters.dateTo)
    }
    
    // Apply location filter if provided
    if (filters.location && filters.location !== "All Locations") {
      invoiceQuery = invoiceQuery.ilike("location", `%${filters.location}%`)
    }
    
    // Execute the invoice query
    const { data: invoices, error: invoiceError } = await invoiceQuery
    
    if (invoiceError) {
      console.error("Error fetching invoices:", invoiceError)
      throw new Error("Failed to fetch invoices")
    }
    
    if (!invoices || invoices.length === 0) {
      log("No invoices found matching filters")
      return []
    }
    
    // Get all invoice IDs
    const invoiceIds = invoices.map(invoice => invoice.id)
    log(`Found ${invoiceIds.length} invoices matching filters, fetching line items for SKU: ${filters.sku}`)
    
    // Now get the invoice lines for these invoices and the specific SKU
    let linesQuery = supabase
      .from("invoice_lines")
      .select("*")
      .in("invoice_id", invoiceIds)
      .ilike("sku", `%${filters.sku}%`)
    
    // Apply category filter if provided
    if (filters.category && filters.category !== "All Categories") {
      linesQuery = linesQuery.ilike("category", `%${filters.category}%`)
    }
    
    // Apply limit if provided
    if (filters.limit) {
      const limitNum = parseInt(filters.limit, 10)
      if (!isNaN(limitNum)) {
        linesQuery = linesQuery.limit(limitNum)
      }
    }
    
    // Execute the lines query
    const { data: lines, error: linesError } = await linesQuery
    
    if (linesError) {
      console.error("Error fetching invoice lines by SKU:", linesError)
      throw new Error("Failed to fetch invoice lines by SKU")
    }
    
    if (!lines || lines.length === 0) {
      log("No invoice lines found matching filters and SKU")
      return []
    }
    
    // Create invoice ID to invoice map for easy lookup
    const invoiceMap = invoices.reduce((map, invoice) => {
      map[invoice.id] = invoice
      return map
    }, {})
    
    // Combine invoice data with each line item
    const combinedLines = lines.map(line => ({
      ...line,
      invoice_date: invoiceMap[line.invoice_id]?.invoice_date,
      invoice_number: invoiceMap[line.invoice_id]?.invoice_number,
      source: invoiceMap[line.invoice_id]?.source,
      location: invoiceMap[line.invoice_id]?.location,
      pdf_url: invoiceMap[line.invoice_id]?.pdf_url,
    }))
    
    // Final sort by date to ensure consistency after joining (newest first)
    const sortedLines = combinedLines.sort((a, b) => {
      // Convert to Date objects for proper comparison
      const dateA = new Date(a.invoice_date || '')
      const dateB = new Date(b.invoice_date || '')
      return dateB.getTime() - dateA.getTime() // Descending order (newest first)
    })
    
    log(`Returning ${sortedLines.length} invoice lines for SKU ${filters.sku} (sorted by date desc)`)
    return sortedLines
    
  } catch (error) {
    console.error("Error in fetchInvoiceLinesBySkuAndFilters:", error)
    return []
  }
}
