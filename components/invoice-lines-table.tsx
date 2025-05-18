"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { fetchInvoiceLinesByFilters, fetchInvoiceLinesBySkuAndFilters } from "@/lib/server-actions"
import { log } from "@/lib/logger"
import { useColumnVisibility, TABLE_COLUMNS } from "@/context/column-visibility-context"

export function InvoiceLinesTable() {
  const searchParams = useSearchParams();
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Access column visibility settings
  const { visibleColumns } = useColumnVisibility();
  
  // Helper function to check if a column should be displayed
  const isColumnVisible = (columnId: string) => visibleColumns.includes(columnId);

  // Handle column sorting
  const handleSort = (field: string) => {
    // If clicking the same field, toggle direction, otherwise set new field with asc direction
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sorted data
  const getSortedData = () => {
    if (!sortField) return lines;
    
    return [...lines].sort((a, b) => {
      // Get values based on field name
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle special fields
      if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }
      if (sortField === 'unit_price' || sortField === 'line_total') {
        aValue = parseFloat(a[sortField]) || 0;
        bValue = parseFloat(b[sortField]) || 0;
      }
      if (sortField === 'qty') {
        aValue = parseFloat(a[sortField]) || 0;
        bValue = parseFloat(b[sortField]) || 0;
      }
      
      // Compare values
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  useEffect(() => {
    async function loadLines() {
      setLoading(true);
      const filters = {
        location: searchParams.get('location') || '',
        category: searchParams.get('category') || '',
        dateFrom: searchParams.get('dateFrom') || '',
        dateTo: searchParams.get('dateTo') || '',
        sku: searchParams.get('sku') || '',
        limit: searchParams.get('limit') || '50', // Default to 50 if not specified
      };
      
      log('InvoiceLinesTable - Loading with filters:', filters);
      log('Current search params:', Object.fromEntries([...searchParams.entries()]));
      
      // Skip loading if we don't have date filters yet - this prevents the flicker
      // The header component will set proper date filters which will trigger a load
      if (!filters.dateFrom || !filters.dateTo) {
        log('Skipping initial load until date filters are set');
        return;
      }
      
      let allLines: any[] = [];
      try {
        if (filters.sku) {
          // Only fetch lines for the selected SKU
          allLines = await fetchInvoiceLinesBySkuAndFilters(filters);
        } else {
          allLines = await fetchInvoiceLinesByFilters(filters);
        }
        setLines(allLines);
        log(`Loaded ${allLines.length} invoice lines`);
        
        // Log total number of SKUs (including duplicates)
        const allSkus = allLines.map(line => line.sku).filter(Boolean);
        log(`TOTAL SKUs: ${allSkus.length} SKUs found in the results (including duplicates)`);
        log('Sample SKUs (first 10):', allSkus.slice(0, 10));
        
        // Log unique categories found
        const categories = [...new Set(allLines.map(line => line.category))];
        log('Categories found in invoice lines:', categories);
        
        // Count items per category
        const categoryCounts = allLines.reduce((acc, line) => {
          acc[line.category] = (acc[line.category] || 0) + 1;
          return acc;
        }, {});
        log('Category distribution:', categoryCounts);
      } catch (error) {
        console.error('Error loading invoice lines:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  return (
    <div className="space-y-4">
      <Card className="border-slate-800 bg-slate-900 shadow-lg">
        <div className="rounded-md border border-slate-800">
          <Table>
            <TableHeader className="bg-slate-800/90">
              <TableRow>
                {/* Date Column */}
                {isColumnVisible('date') && (
                  <TableHead 
                    className={`text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors ${sortField === 'date' ? 'text-emerald-400' : ''}`}
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortField === 'date' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )}
                
                {/* Vendor Column */}
                {isColumnVisible('vendor_name') && (
                  <TableHead 
                    className={`text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors ${sortField === 'vendor_name' ? 'text-emerald-400' : ''}`}
                    onClick={() => handleSort('vendor_name')}
                  >
                    <div className="flex items-center">
                      Vendor
                      {sortField === 'vendor_name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )}
                
                {/* Location Column */}
                {isColumnVisible('location') && (
                  <TableHead 
                    className={`text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors ${sortField === 'location' ? 'text-emerald-400' : ''}`}
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center">
                      Location
                      {sortField === 'location' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )}
                
                {/* Category Column */}
                {isColumnVisible('category') && (
                  <TableHead 
                    className={`text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors ${sortField === 'category' ? 'text-emerald-400' : ''}`}
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      {sortField === 'category' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )}
                
                {/* Description Column */}
                {isColumnVisible('description') && (
                  <TableHead 
                    className={`text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors ${sortField === 'description' ? 'text-emerald-400' : ''}`}
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      Description
                      {sortField === 'description' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )}
                
                {/* Quantity Column */}
                {isColumnVisible('qty') && (
                  <TableHead 
                    className={`text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors ${sortField === 'qty' ? 'text-emerald-400' : ''}`}
                    onClick={() => handleSort('qty')}
                  >
                    <div className="flex items-center">
                      Qty
                      {sortField === 'qty' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )}
                
                {/* Unit Price Column */}
                {isColumnVisible('unit_price') && (
                  <TableHead 
                    className={`text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors ${sortField === 'unit_price' ? 'text-emerald-400' : ''}`}
                    onClick={() => handleSort('unit_price')}
                  >
                    <div className="flex items-center">
                      Unit Price
                      {sortField === 'unit_price' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )}
                
                {/* Line Total Column */}
                {isColumnVisible('line_total') && (
                  <TableHead 
                    className={`text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors ${sortField === 'line_total' ? 'text-emerald-400' : ''}`}
                    onClick={() => handleSort('line_total')}
                  >
                    <div className="flex items-center">
                      Line Total
                      {sortField === 'line_total' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )}
                
                {/* Invoice Number Column */}
                {isColumnVisible('invoice_number') && (
                  <TableHead 
                    className={`text-slate-200 font-medium cursor-pointer hover:text-emerald-400 transition-colors ${sortField === 'invoice_number' ? 'text-emerald-400' : ''}`}
                    onClick={() => handleSort('invoice_number')}
                  >
                    <div className="flex items-center">
                      Invoice #
                      {sortField === 'invoice_number' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )}
                
                {/* PDF Column */}
                {isColumnVisible('pdf_url') && (
                  <TableHead className="text-slate-200 font-medium text-center">PDF</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length || 1} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent"></div>
                      <span className="text-slate-400">Loading invoice data...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : lines.length > 0 ? (
                getSortedData().map((line, idx) => (
                  <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/60 transition-colors">
                    {/* Date Cell */}
                    {isColumnVisible('date') && (
                      <TableCell className="text-slate-300 py-3">{formatDate(line.invoice_date)}</TableCell>
                    )}
                    
                    {/* Vendor Cell */}
                    {isColumnVisible('vendor_name') && (
                      <TableCell className="text-slate-300 py-3">{line.source}</TableCell>
                    )}
                    
                    {/* Location Cell */}
                    {isColumnVisible('location') && (
                      <TableCell className="text-slate-300 py-3">{line.location}</TableCell>
                    )}
                    
                    {/* Category Cell */}
                    {isColumnVisible('category') && (
                      <TableCell className="text-slate-300 py-3">
                        <span className="flex items-center space-x-1">
                          {line.category && line.category.toLowerCase().includes('chemical') && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 2v7.31" />
                              <path d="M14 9.3V1.99" />
                              <path d="M8.5 2h7" />
                              <path d="M14 9.3a6 6 0 1 1-4 0" />
                            </svg>
                          )}
                          {line.category && line.category.toLowerCase().includes('equipment') && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                          )}
                          {line.category && line.category.toLowerCase().includes('labor') && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="8" r="5" />
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <polyline points="16 16 18 18 22 14" />
                            </svg>
                          )}
                          {line.category && (
                            !line.category.toLowerCase().includes('chemical') && 
                            !line.category.toLowerCase().includes('equipment') && 
                            !line.category.toLowerCase().includes('labor')) && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 8v4" />
                              <path d="M12 16h.01" />
                            </svg>
                          )}
                          {line.category}
                        </span>
                      </TableCell>
                    )}
                    
                    {/* Description Cell */}
                    {isColumnVisible('description') && (
                      <TableCell className="text-slate-300 py-3 max-w-xs truncate" title={line.description}>{line.description}</TableCell>
                    )}
                    
                    {/* Quantity Cell */}
                    {isColumnVisible('qty') && (
                      <TableCell className="text-slate-300 py-3">{line.qty}</TableCell>
                    )}
                    
                    {/* Unit Price Cell */}
                    {isColumnVisible('unit_price') && (
                      <TableCell className="text-slate-300 py-3">{formatCurrency(line.unit_price)}</TableCell>
                    )}
                    
                    {/* Line Total Cell */}
                    {isColumnVisible('line_total') && (
                      <TableCell className="text-slate-300 py-3 font-medium text-emerald-400">{formatCurrency(line.line_total)}</TableCell>
                    )}
                    
                    {/* Invoice Number Cell */}
                    {isColumnVisible('invoice_number') && (
                      <TableCell className="text-slate-300 py-3">
                        <span className="px-2 py-1 bg-slate-800 rounded-md text-xs">{line.invoice_number || 'N/A'}</span>
                      </TableCell>
                    )}
                    
                    {/* PDF Cell */}
                    {isColumnVisible('pdf_url') && (
                      <TableCell className="text-center py-3">
                        {line.pdf_url ? (
                          <a 
                            href={line.pdf_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            title="View PDF" 
                            className="inline-flex items-center justify-center text-emerald-500 hover:text-emerald-400 transition-colors p-1 rounded-full hover:bg-slate-800"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>
                        ) : null}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length || 1} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-slate-400 text-lg">No invoice data found</span>
                      <p className="text-slate-500 text-sm max-w-md">Try adjusting your filter criteria to see more results.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
