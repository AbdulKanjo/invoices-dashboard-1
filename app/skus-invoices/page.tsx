"use client";
import { Suspense } from "react";
import { useRequireAuth } from "@/hooks/use-auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

// Create a client component that will be wrapped with Suspense
const SkusInvoicesContent = () => {
  // Import and use hooks inside the client component
  const { useSearchParams } = require("next/navigation");
  const { useEffect, useState } = require("react");
  const { fetchInvoiceLinesBySkuAndFilters } = require("@/lib/server-actions");
  
  const searchParams = useSearchParams();
  const [lines, setLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLines() {
      setLoading(true);
      const filters = {
        sku: searchParams.get("sku") || "",
        location: searchParams.get("location") || "",
        dateFrom: searchParams.get("dateFrom") || "",
        dateTo: searchParams.get("dateTo") || "",
      };
      const data = await fetchInvoiceLinesBySkuAndFilters(filters);
      setLines(data);
      setLoading(false);
    }
    loadLines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Invoices for SKU: <span className="text-emerald-400">{searchParams.get("sku")}</span></h1>
      <Card className="border-slate-800 bg-slate-900">
        <div className="rounded-md border border-slate-800">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow>
                <TableHead className="text-slate-300">Date</TableHead>
                <TableHead className="text-slate-300">Vendor</TableHead>
                <TableHead className="text-slate-300">Location</TableHead>
                <TableHead className="text-slate-300">Category</TableHead>
                <TableHead className="text-slate-300">Description</TableHead>
                <TableHead className="text-slate-300">Qty</TableHead>
                <TableHead className="text-slate-300">Unit Price</TableHead>
                <TableHead className="text-slate-300">Line Total</TableHead>
                <TableHead className="text-slate-300">Invoice #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : lines.length ? (
                lines.map((line, idx) => (
                  <TableRow key={idx} className="border-slate-800 hover:bg-slate-800">
                    <TableCell>{formatDate(line.invoice_date)}</TableCell>
                    <TableCell>{line.source}</TableCell>
                    <TableCell>{line.location}</TableCell>
                    <TableCell>{line.category}</TableCell>
                    <TableCell>{line.description}</TableCell>
                    <TableCell>{line.qty}</TableCell>
                    <TableCell>{formatCurrency(line.unit_price)}</TableCell>
                    <TableCell>{formatCurrency(line.line_total)}</TableCell>
                    <TableCell>{line.invoice_number || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No results.
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

// Main component that uses Suspense
export default function SkusInvoicesPage() {
  const loading = useRequireAuth();
  if (loading) return null;
  return (
    <Suspense fallback={
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Loading SKU invoices...</h1>
        <Card className="border-slate-800 bg-slate-900">
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
            <span className="ml-2 text-slate-300">Loading...</span>
          </div>
        </Card>
      </div>
    }>
      <SkusInvoicesContent />
    </Suspense>
  );
}
