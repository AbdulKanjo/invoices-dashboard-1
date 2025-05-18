// Consolidated exports for dashboard and invoices functionality
// This file acts as a facade to the modular server actions

// Export types without conflicts
export * from "./server-actions/types"

// Export from locations module
export { fetchAllLocations, fetchLocationCategoryHeatMap } from "./server-actions/locations"

// Export from categories module
export { 
  fetchAllCategories,
  fetchCategorySpendTrend,
  fetchCategoryVolatility
} from "./server-actions/categories"

// Export from invoices module
export * from "./server-actions/invoices"

// Export from skus module, but rename conflicting functions
export {
  fetchAllSkus,
  fetchTopSkusBySpend,
  fetchSkuReplenishmentCadence,
  // Rename these functions to avoid conflicts
  fetchAllCategories as fetchSkuCategories,
  fetchAllLocations as fetchSkuLocations
} from "./server-actions/skus"

// Export from dashboard module
export * from "./server-actions/dashboard"

// Export from invoice-lines module
export * from "./server-actions/invoice-lines"
