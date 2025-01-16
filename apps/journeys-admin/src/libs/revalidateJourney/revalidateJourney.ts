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
  const params: { accessToken: string; slug: string; hostname?: string } = {
    slug,
    accessToken: process.env.NEXT_PUBLIC_JOURNEYS_REVALIDATE_ACCESS_TOKEN
  }
  if (hostname != null) params.hostname = hostname

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_JOURNEYS_URL}/api/revalidate?${new URLSearchParams(params).toString()}`
    )
    console.log(response)
    if (response.ok) return response
  } catch (e) {
    console.log(e)
  }
}
