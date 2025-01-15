import fetch, { Response } from 'node-fetch'

export async function revalidateJourney({
  slug,
  hostname
}: {
  slug: string
  hostname?: string
}): Promise<Response | null | undefined> {
  if (
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN == null ||
    process.env.JOURNEYS_URL == null
  )
    return null
  const params = {
    slug,
    accessToken: process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN,
    ...(hostname != null && { hostname })
  }

  const response = await fetch(
    `${process.env.JOURNEYS_URL}/api/revalidate?${new URLSearchParams(params).toString()}`
  )
  if (response.ok) return response
}
