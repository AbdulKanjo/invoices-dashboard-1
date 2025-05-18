// Common types used across server actions

export type Invoice = {
  id: string
  invoice_date: string
  source: string
  invoice_total: number
  location: string
  email_subject: string
  pdf_url: string
  status: string
  invoice_number?: string
  vendor_name?: string
  subtotal?: number
  tax?: number
  shipping?: number
  total?: number
  lines: InvoiceLine[]
}

export type InvoiceLine = {
  id: string
  invoice_id: string
  line_number: number
  sku: string
  description: string
  uom: string
  qty: number
  unit_price: number
  line_total: number
  tax: number
  category: string
  created_at: string
}

// Common filter types
export interface DateRangeFilter {
  dateFrom?: string
  dateTo?: string
}

export interface LocationFilter {
  location?: string
}

export interface CategoryFilter {
  category?: string
}

export type SearchFilter = {
  search?: string
}

// Combined filter types
export interface InvoiceFilters extends DateRangeFilter, LocationFilter, CategoryFilter, SearchFilter {
  limit?: string;
  sku?: string;
}
