import fetch, { Response } from 'node-fetch'

export async function revalidateJourney({
  slug,
  hostname
}: {
  slug: string
  hostname?: string
}): Promise<Response | null | undefined> {
  console.log('I am being called')
  if (
    process.env.NEXT_PUBLIC_JOURNEYS_REVALIDATE_ACCESS_TOKEN == null ||
    process.env.NEXT_PUBLIC_JOURNEYS_URL == null
  ) {
    console.log('I am returning null')
    return null
  }
  const params = {
    slug,
    accessToken: process.env.NEXT_PUBLIC_JOURNEYS_REVALIDATE_ACCESS_TOKEN,
    ...(hostname != null && { hostname })
  }

  try {
    const response = await fetch(
      `${process.env.JOURNEYS_URL}/api/revalidate?${new URLSearchParams(params).toString()}`
    )
    console.log(response)
    if (response.ok) return response
  } catch (e) {
    console.log(e)
  }
}
