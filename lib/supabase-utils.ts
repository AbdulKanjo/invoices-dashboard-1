// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Makes a Supabase request with retry logic and caching
 */
export async function safeSupabaseRequest<T>(
  cacheKey: string,
  requestFn: () => Promise<{ data: T | null; error: any }>,
  options: {
    maxRetries?: number
    retryDelay?: number
    cacheTTL?: number
    fallbackData?: T
  } = {},
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, cacheTTL = CACHE_TTL, fallbackData = null as unknown as T } = options

  // Check cache first
  const cachedItem = cache[cacheKey]
  if (cachedItem && Date.now() - cachedItem.timestamp < cacheTTL) {
    console.log(`Using cached data for ${cacheKey}`)
    return cachedItem.data
  }

  let lastError: any = null

  // Try the request with retries
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add a small delay between retries (except for the first attempt)
      if (attempt > 0) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffDelay = retryDelay * Math.pow(2, attempt - 1)
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} for ${cacheKey} after ${backoffDelay}ms delay`)
        await new Promise((resolve) => setTimeout(resolve, backoffDelay))
      }

      const { data, error } = await requestFn()

      if (error) {
        console.error(`Error on attempt ${attempt + 1}/${maxRetries} for ${cacheKey}:`, error)
        lastError = error
        continue // Try again
      }

      if (data === null) {
        console.warn(`No data returned on attempt ${attempt + 1}/${maxRetries} for ${cacheKey}`)
        continue // Try again
      }

      // Success - cache the result and return
      cache[cacheKey] = { data, timestamp: Date.now() }
      return data as T
    } catch (error) {
      console.error(`Exception on attempt ${attempt + 1}/${maxRetries} for ${cacheKey}:`, error)
      lastError = error
    }
  }

  // All retries failed, use fallback data
  console.error(`All ${maxRetries} attempts failed for ${cacheKey}. Using fallback data.`)

  if (fallbackData !== null) {
    return fallbackData
  }

  throw lastError || new Error(`Failed to fetch data for ${cacheKey}`)
}

/**
 * Clears the cache for a specific key or all keys
 */
export function clearCache(key?: string) {
  if (key) {
    delete cache[key]
  } else {
    Object.keys(cache).forEach((k) => delete cache[k])
  }
}
