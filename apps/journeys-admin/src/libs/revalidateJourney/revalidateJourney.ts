import fetch, { Response } from 'node-fetch'

export async function revalidateJourney({
  slug,
  hostname
}: {
  slug: string
  hostname?: string
}): Promise<Response | null | undefined> {
  if (
    process.env.NEXT_PUBLIC_JOURNEYS_REVALIDATE_ACCESS_TOKEN == null ||
    process.env.NEXT_PUBLIC_JOURNEYS_URL == null
  ) {
    return null
  }

  const journeyPath = `/api/revalidate?slug=${slug}`
  const customDomainParam = hostname != null ? `&hostname=${hostname}` : ''
  const href = journeyPath + customDomainParam
  try {
    const response = await fetch(href)
    if (response.ok) return response
  } catch (e) {
    throw new Error('failed to revalidate journey')
  }
}
