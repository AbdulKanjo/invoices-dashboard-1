"use server"

import { supabase } from "@/lib/supabase"
import type { InvoiceFilters, InvoiceLine } from "./types"
import { log } from "@/lib/logger"
import { applyDateFilter, getIgnoreInvoiceIds } from "./utils"

/**
 * Fetches invoices with filtering options
 */
export async function fetchInvoices(filters: InvoiceFilters) {
  let query = supabase.from("invoices").select("*")

  if (filters.location) {
    query = query.eq("location", filters.location)
  }

  query = applyDateFilter(query, filters.dateFrom, filters.dateTo)

  if (filters.search) {
    query = query.or(`source.ilike.%${filters.search}%,email_subject.ilike.%${filters.search}%`)
  }

  const { data: invoices, error: invoicesError } = await query

  if (invoicesError) {
    console.error("Error fetching invoices:", invoicesError)
    throw new Error("Failed to fetch invoices")
  }

  // Fetch invoice lines for all invoices
  const invoiceIds = invoices.map((invoice) => invoice.id)

  let linesQuery = supabase
    .from("invoice_lines")
    .select("*")
    .in("invoice_id", invoiceIds)
    .not("category", "ilike", "%ignore%") // Filter out ignore categories

  if (filters.category) {
    linesQuery = linesQuery.eq("category", filters.category)
  }

  const { data: lines, error: linesError } = await linesQuery

  if (linesError) {
    console.error("Error fetching invoice lines:", linesError)
    throw new Error("Failed to fetch invoice lines")
  }

  // Group lines by invoice_id
  const linesByInvoiceId = lines.reduce(
    (acc, line) => {
      if (!acc[line.invoice_id]) {
        acc[line.invoice_id] = []
      }
      acc[line.invoice_id].push(line)
      return acc
    },
    {} as Record<string, InvoiceLine[]>,
  )

  // Get ignore invoice IDs
  const ignoreInvoiceIds = await getIgnoreInvoiceIds(invoiceIds)

  // Filter out invoices that have "ignore" category lines
  const filteredInvoices = invoices.filter((invoice) => !ignoreInvoiceIds.has(invoice.id))

  // If category filter is applied, only include invoices that have matching lines
  const categoryFilteredInvoices = filters.category
    ? filteredInvoices.filter((invoice) => linesByInvoiceId[invoice.id]?.length > 0)
    : filteredInvoices

  // Combine invoices with their lines
  return categoryFilteredInvoices.map((invoice) => ({
    ...invoice,
    lines: linesByInvoiceId[invoice.id] || [],
  }))
}

/**
 * Exports invoices to CSV format
 */
export async function exportInvoices(filters: InvoiceFilters) {
  const invoices = await fetchInvoices(filters)

  // Format data for CSV export
  const csvData = invoices.flatMap((invoice) =>
    invoice.lines.map((line) => ({
      invoice_id: invoice.id,
      invoice_date: invoice.invoice_date,
      source: invoice.source,
      location: invoice.location,
      status: invoice.status,
      description: line.description,
      category: line.category,
      line_total: line.line_total,
      invoice_total: invoice.invoice_total,
    })),
  )

  return csvData
}

function applyLocationFilter(query: any, locations?: string[]) {
  log("Inside applyLocationFilter with locations:", locations);
  
  if (locations && locations.length > 0) {
    // Make sure locations is valid for filtering 
    const validLocations = locations.filter(loc => loc && loc.trim() !== "" && loc !== "All Locations");
    
    if (validLocations.length === 1) {
      // For a single location, use ilike for case-insensitive match
      log("Applying ILIKE filter with location:", validLocations[0]);
      return query.ilike("location", `%${validLocations[0]}%`);
    } else if (validLocations.length > 1) {
      // For multiple locations, still use in() but with some flexibility
      log("Applying IN filter with locations:", validLocations);
      return query.in("location", validLocations);
    }
  }
  
  return query;
}

/**
 * Fetches the most expensive invoices
 */
export async function fetchMostExpensiveInvoices({
  dateFrom,
  dateTo,
  location,
  category,
}: {
  dateFrom?: string
  dateTo?: string
  location?: string
  category?: string
} = {}) {
  try {
    log("NEW APPROACH: Starting with simplified query");
    log("Params:", { dateFrom, dateTo, location, category });

    // Step 1: Get all invoices that match date and location filters
    let query = supabase
      .from("invoices")
      .select("id, invoice_date, invoice_number, source, location, invoice_total, pdf_url")
      .order("invoice_total", { ascending: false });
      
    // Apply date filters
    if (dateFrom) {
      query = query.gte("invoice_date", dateFrom);
    }
    
    if (dateTo) {
      query = query.lte("invoice_date", dateTo);
    }

    // Apply location filter if provided
    if (location && location !== "All Locations") {
      // Get the exact location formatting
      const { data: exactLocation } = await supabase
        .from("invoices")
        .select("location")
        .eq("location", location)
        .limit(1);

      if (exactLocation && exactLocation.length > 0) {
        log("Found exact location match:", exactLocation[0].location);
        query = query.eq("location", exactLocation[0].location);
      } else {
        log("No exact match, trying with ILIKE");
        query = query.ilike("location", `%${location}%`);
      }
    }

    // Execute the query
    const { data: invoices, error } = await query;
    
    if (error) {
      console.error("Query error:", error);
      return [];
    }
    
    log("Found", invoices?.length || 0, "invoices after date/location filtering");
    
    // If no category filter or no invoices, return what we have
    if (!category || category === "All Categories" || !invoices || invoices.length === 0) {
      return invoices?.slice(0, 20) || [];
    }
    
    // Step 2: For category filtering, we need to join with invoice_lines
    const invoiceIds = invoices.map(invoice => invoice.id);
    log("Looking for category", category, "in these invoices:", invoiceIds);
    
    // First, get a sample of invoice lines to understand the data structure
    const { data: sampleLines } = await supabase
      .from("invoice_lines")
      .select("*")
      .limit(5);
    
    log("Sample invoice lines data structure:", sampleLines);
    
    // Get all invoice lines for these invoices
    const { data: categoryLines, error: categoryError } = await supabase
      .from("invoice_lines")
      .select("invoice_id, category, description")
      .in("invoice_id", invoiceIds);
      
    if (categoryError) {
      console.error("Category query error:", categoryError);
      return invoices.slice(0, 20); // Fall back to all invoices
    }
    
    if (!categoryLines || categoryLines.length === 0) {
      log("No invoice lines found for any of these invoices");
      // Return the invoices without category filtering as a fallback
      return invoices.slice(0, 20);
    }

    // Log categories for debugging
    const availableCategories = [...new Set(categoryLines.map(line => line.category))];
    log("Available categories:", availableCategories);
    
    // Get IDs of invoices that have the specified category (case insensitive)
    const matchingIds = new Set();
    const normalizedCategory = category.toLowerCase();
    
    categoryLines.forEach(line => {
      if (line.category && line.invoice_id) {
        if (line.category.toLowerCase().includes(normalizedCategory)) {
          matchingIds.add(line.invoice_id);
        }
      }
    });
    
    log("Found", matchingIds.size, "invoices with matching category");
    
    // Filter invoices to those with matching categories
    const filteredInvoices = invoices.filter(invoice => matchingIds.has(invoice.id));
    
    // Sort by invoice_total and take top 20
    return filteredInvoices.slice(0, 20);
  
    
    // STEP 4: Sort by invoice_total and take the top 20
    const result = filteredInvoices
      .sort((a, b) => Number(b.invoice_total) - Number(a.invoice_total))
      .slice(0, 20);
    
    log("Final result:", result.length, "invoices");
    return result;
  } catch (error) {
    console.error("Error in fetchMostExpensiveInvoices:", error)
    return []
  }
}
