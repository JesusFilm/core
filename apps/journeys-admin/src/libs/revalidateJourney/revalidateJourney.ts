import fetch, { Response } from 'node-fetch'

export async function revalidateJourney({
  slug,
  hostname
}: {
  slug: string
  hostname?: string
}): Promise<Response | null | undefined> {
  const params = new URLSearchParams({ slug })

  if (hostname != null) {
    params.append('hostname', hostname)
  }

  try {
    const response = await fetch(`/api/revalidate?${params.toString()}`)
    if (response.ok) return response
  } catch (e) {
    throw new Error('failed to revalidate journey')
  }
}
