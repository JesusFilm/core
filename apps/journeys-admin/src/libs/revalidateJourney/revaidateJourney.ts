import fetch from 'node-fetch'

export async function revalidateJourney(args: {
  slug: string
  hostname?: string
}): Promise<void> {
  if (process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN == null) return
  const params = {
    ...args,
    accessToken: process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  }
  try {
    await fetch(
      `${process.env.JOURNEYS_URL}/api/revalidate?${new URLSearchParams(
        params
      ).toString()}`
    )
  } catch (e) {
    throw new Error(`Error revalidating: ${e.message}`)
  }
}
