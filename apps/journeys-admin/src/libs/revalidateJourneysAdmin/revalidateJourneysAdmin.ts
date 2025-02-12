export async function revalidateJourneysAdmin(
  journeyId: string
): Promise<Response | null | undefined> {
  const href = `/api/revalidateAdmin?journeyId=${journeyId}`
  try {
    const response = await fetch(href)
    if (response.ok) return response
  } catch (e) {
    throw new Error('failed to revalidate journey')
  }
}
