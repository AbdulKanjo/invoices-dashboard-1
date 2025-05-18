"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the available table columns
export const TABLE_COLUMNS = [
  { id: 'date', label: 'Date' },
  { id: 'vendor_name', label: 'Vendor' },
  { id: 'location', label: 'Location' },
  { id: 'category', label: 'Category' },
  { id: 'description', label: 'Description' },
  { id: 'qty', label: 'Qty' },
  { id: 'unit_price', label: 'Unit Price' },
  { id: 'line_total', label: 'Line Total' },
  { id: 'invoice_number', label: 'Invoice #' },
  { id: 'pdf_url', label: 'PDF' },
];

type ColumnVisibilityContextType = {
  visibleColumns: string[];
  toggleColumnVisibility: (columnId: string) => void;
  toggleAllColumns: (selected: boolean) => void;
};

const ColumnVisibilityContext = createContext<ColumnVisibilityContextType | undefined>(undefined);

export function ColumnVisibilityProvider({ children }: { children: ReactNode }) {
  // Column visibility state - all columns visible by default
  const [visibleColumns, setVisibleColumns] = useState<string[]>(TABLE_COLUMNS.map(col => col.id));

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns(current => {
      if (current.includes(columnId)) {
        return current.filter(id => id !== columnId);
      } else {
        return [...current, columnId];
      }
    });
  };

  // Select or deselect all columns
  const toggleAllColumns = (selected: boolean) => {
    if (selected) {
      setVisibleColumns(TABLE_COLUMNS.map(col => col.id));
    } else {
      setVisibleColumns([]);
    }
  };

  // Load saved column visibility on initial render
  useEffect(() => {
    const savedColumns = localStorage.getItem('invoiceTableColumns');
    if (savedColumns) {
      try {
        setVisibleColumns(JSON.parse(savedColumns));
      } catch (error) {
        console.error('Failed to parse saved column settings', error);
      }
    }
  }, []);

  // Save column visibility to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('invoiceTableColumns', JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  return (
    <ColumnVisibilityContext.Provider value={{ visibleColumns, toggleColumnVisibility, toggleAllColumns }}>
      {children}
    </ColumnVisibilityContext.Provider>
  );
}

export function useColumnVisibility() {
  const context = useContext(ColumnVisibilityContext);
  if (context === undefined) {
    throw new Error('useColumnVisibility must be used within a ColumnVisibilityProvider');
  }
  return context;
}
