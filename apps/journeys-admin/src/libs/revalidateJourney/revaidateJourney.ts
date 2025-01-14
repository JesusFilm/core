import fetch, { Response } from 'node-fetch'

export async function revalidateJourney(args: {
  slug: string
  hostname?: string
}): Promise<Response | null | undefined> {
  if (
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN == null ||
    process.env.JOURNEYS_URL
  )
    return null
  const params = {
    ...args,
    accessToken: process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  }

  const response = await fetch(
    `${process.env.JOURNEYS_URL}/api/revalidate?${new URLSearchParams(
      params
    ).toString()}`
  )
  if (response.ok) return response
}
