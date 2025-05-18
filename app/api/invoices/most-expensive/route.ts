import { NextResponse } from 'next/server';
import { fetchMostExpensiveInvoices } from '@/lib/server-actions/invoices';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("API ROUTE: Received request body:", body);
    
    // Destructure with default values to ensure we always have valid data types
    // Support both naming formats (locations/categories and location/category)
    const { 
      dateFrom = undefined, 
      dateTo = undefined, 
      location = undefined, 
      category = undefined,
      locations = undefined,
      categories = undefined
    } = body;
    
    // Use either the singular or plural version, preferring singular if both exist
    const locationParam = location || (Array.isArray(locations) && locations.length === 1 ? locations[0] : locations);
    const categoryParam = category || (Array.isArray(categories) && categories.length === 1 ? categories[0] : categories);
    
    console.log("API ROUTE: Processed filters:", { 
      dateFrom, 
      dateTo, 
      location: locationParam, 
      category: categoryParam 
    });
    
    // Call the server action with the validated parameters
    const invoices = await fetchMostExpensiveInvoices({
      dateFrom,
      dateTo,
      location: locationParam,
      category: categoryParam,
    });
    
    console.log("API ROUTE: Returning", invoices.length, "invoices");
    
    // Return the invoices as JSON
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch most expensive invoices' },
      { status: 500 }
    );
  }
}
