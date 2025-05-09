'use server'

/**
 * Calls the watch app's /api/revalidate endpoint to trigger ISR revalidation for a given path.
 * @param url The path to revalidate (e.g. '/watch/slug.html/lang.html')
 * @returns Promise<{ revalidated: boolean; url?: string; error?: string }>
 */
export async function revalidateWatchApp(
  url: string
): Promise<{ revalidated: boolean; url?: string; error?: string }> {
  if (typeof url !== 'string' || !url.startsWith('/')) {
    return { revalidated: false, error: 'Invalid url' }
  }
  const watchUrl = process.env.NEXT_PUBLIC_WATCH_URL
  const secret = process.env.WATCH_REVALIDATE_SECRET
  if (!watchUrl || !secret) {
    return {
      revalidated: false,
      error: 'Missing NEXT_PUBLIC_WATCH_URL or WATCH_REVALIDATE_SECRET env var'
    }
  }
  const endpoint = `${watchUrl}/api/revalidate?secret=${secret}`
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    const data = await res.json()
    if (!res.ok) {
      return {
        revalidated: false,
        error: data.message || 'Failed to revalidate'
      }
    }
    return { revalidated: true, url: data.url }
  } catch (error) {
    return { revalidated: false, error: (error as Error).message }
  }
}
