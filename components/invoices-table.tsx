"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDate } from "@/lib/utils"
import { fetchInvoices } from "@/lib/server-actions"

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

export function InvoicesTable() {
  const searchParams = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    dateFrom: "",
    dateTo: "",
    category: "",
    sku: "",
  })

  // Helper to filter lines by SKU if needed
  const filterLinesBySku = (lines: InvoiceLine[]) => {
    if (filters.sku) {
      return lines.filter((line) => line.sku === filters.sku);
    }
    return lines;
  }

  // On mount, set filters from URL query params if present
  useEffect(() => {
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const search = searchParams.get('search') || '';
    const sku = searchParams.get('sku') || '';
    setFilters((prev) => ({
      ...prev,
      location,
      category,
      dateFrom,
      dateTo,
      search,
      sku,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function loadInvoices() {
      try {
        setLoading(true)
        console.log('[InvoicesTable] Loading invoices with filters:', filters)
        const invoices = await fetchInvoices(filters)
        console.log('[InvoicesTable] Data returned from fetchInvoices:', invoices)
        setData(invoices)
        if (invoices && invoices.length > 0) {
          // Debug: log the first invoice
          // eslint-disable-next-line no-console
          console.log('First fetched invoice:', invoices[0]);
          // eslint-disable-next-line no-console
          console.log('First invoice pdf_url:', invoices[0].pdf_url);
        }
      } catch (error) {
        console.error("Error loading invoices:", error)
      } finally {
        setLoading(false)
      }
    }

    loadInvoices()
  }, [filters])

  const columns: ColumnDef<Invoice>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "invoice_date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{formatDate(row.getValue("invoice_date"))}</div>,
    },

    {
      accessorKey: "source",
      header: "Vendor",
      cell: ({ row }) => <div>{row.getValue("source")}</div>,
    },
    {
      accessorKey: "invoice_number",
      header: "Invoice #",
      cell: ({ row }) => <div>{row.getValue("invoice_number")}</div>,
    },
    {
      id: "pdf",
      header: () => <FileText className="h-5 w-5 mx-auto text-slate-400" title="PDF" />,
      cell: ({ row }) => {
        const pdfUrl = row.original.pdf_url;
        return pdfUrl ? (
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-emerald-500 hover:text-emerald-700" title="View PDF">
            <FileText className="h-5 w-5" />
          </a>
        ) : null;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "invoice_total",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("invoice_total"))
        return <div>{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <div>{row.getValue("location")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              status === "Paid"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            }`}
          >
            {status}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const invoice = row.original
        return null;
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search invoices..."
            value={filters.search}
            onChange={(event) => handleSearch(event.target.value)}
            className="pl-8 bg-slate-800 text-slate-200"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto bg-slate-800 text-slate-200">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card className="border-slate-800 bg-slate-900">
        <div className="rounded-md border border-slate-800">
          <Table>
            <TableHeader className="bg-slate-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-slate-700 hover:bg-slate-800">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-slate-300">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
             <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  // Filter lines by SKU if set
                  let invoice = row.original;
                  let displayLines = invoice.lines;
                  if (filters.sku) {
                    displayLines = invoice.lines.filter((line: InvoiceLine) => line.sku === filters.sku);
                  }
                  // If no lines after filtering, skip rendering this invoice
                  if (!displayLines.length) return null;
                  // Render a row for each matching line
                  return displayLines.map((line: InvoiceLine, idx: number) => (
                    <TableRow
                      key={invoice.id + '-' + line.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-slate-800 hover:bg-slate-800"
                    >
                      {row.getVisibleCells().map((cell, cellIdx) => {
                        // For columns that display line data, override with filtered line
                        if (cell.column.id === 'invoice_date')
                          return <TableCell key={cell.id}>{formatDate(invoice.invoice_date)}</TableCell>;
                        if (cell.column.id === 'source')
                          return <TableCell key={cell.id}>{invoice.source}</TableCell>;
                        if (cell.column.id === 'location')
                          return <TableCell key={cell.id}>{invoice.location}</TableCell>;
                        if (cell.column.id === 'category')
                          return <TableCell key={cell.id}>{line.category}</TableCell>;
                        if (cell.column.id === 'description')
                          return <TableCell key={cell.id}>{line.description}</TableCell>;
                        if (cell.column.id === 'qty')
                          return <TableCell key={cell.id}>{line.qty}</TableCell>;
                        if (cell.column.id === 'unit_price')
                          return <TableCell key={cell.id}>{formatCurrency(line.unit_price)}</TableCell>;
                        if (cell.column.id === 'line_total')
                          return <TableCell key={cell.id}>{formatCurrency(line.line_total)}</TableCell>;
                        if (cell.column.id === 'invoice_number')
                          return <TableCell key={cell.id}>{invoice.invoice_number}</TableCell>;
                        if (cell.column.id === 'pdf') {
                          const pdfUrl = invoice.pdf_url;
                          return pdfUrl ? (
                            <TableCell key={cell.id}>
                              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-emerald-500 hover:text-emerald-700">
                                <FileText className="h-5 w-5" />
                              </a>
                            </TableCell>
                          ) : <TableCell key={cell.id}></TableCell>;
                        }
                        if (cell.column.id === 'status')
                          return <TableCell key={cell.id}>{invoice.status}</TableCell>;
                        // Default fallback
                        return <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>;
                      })}
                    </TableRow>
                  ));
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 p-4">
          <div className="flex-1 text-sm text-slate-400">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-slate-800 text-slate-200"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-slate-800 text-slate-200"
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
