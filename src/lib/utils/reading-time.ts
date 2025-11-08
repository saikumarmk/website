/**
 * Calculate reading time for a post
 * @param text - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Reading time in minutes
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '')
  
  // Count words (split by whitespace and filter empty strings)
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length
  
  // Calculate minutes, minimum 1 minute
  const minutes = Math.ceil(words / wordsPerMinute)
  
  return Math.max(1, minutes)
}

/**
 * Format reading time as a human-readable string
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "5 min read"
 */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`
}

/**
 * Get reading time from post HTML content
 * @param html - Post HTML content
 * @returns Formatted reading time string
 */
export function getReadingTime(html?: string): string | null {
  if (!html) return null
  
  const minutes = calculateReadingTime(html)
  return formatReadingTime(minutes)
}

