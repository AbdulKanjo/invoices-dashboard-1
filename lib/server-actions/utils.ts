"use server"

import { supabase } from "@/lib/supabase"
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js"

/**
 * Applies date range filters to a Supabase query
 */
export async function applyDateFilter<T = any, S = any, R = any>(
  query: PostgrestFilterBuilder<T, S, R>,
  dateFrom?: string,
  dateTo?: string,
): Promise<PostgrestFilterBuilder<T, S, R>> {
  let filteredQuery = query

  if (dateFrom) {
    filteredQuery = filteredQuery.gte("invoice_date", dateFrom)
  }

  if (dateTo) {
    filteredQuery = filteredQuery.lte("invoice_date", dateTo)
  }

  return filteredQuery
}

/**
 * Gets a set of invoice IDs that have "ignore" category lines
 */
export async function getIgnoreInvoiceIds(invoiceIds: string[]): Promise<Set<string>> {
  // If no invoice IDs, return empty set
  if (!invoiceIds.length) {
    return new Set();
  }
  
  // Get all lines with "ignore" in the category for these invoices
  const { data: ignoreLines, error } = await supabase
    .from("invoice_lines")
    .select("invoice_id")
    .in("invoice_id", invoiceIds)
    .ilike("category", "%ignore%");

  if (error) {
    console.error("Error fetching ignore lines:", error);
    return new Set();
  }

  // Return set of invoice IDs that have "ignore" category lines
  return new Set(ignoreLines.map((line: { invoice_id: string }) => line.invoice_id));
}
