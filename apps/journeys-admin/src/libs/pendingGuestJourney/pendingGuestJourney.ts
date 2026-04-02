const STORAGE_KEY = 'pendingGuestJourney'

interface PendingGuestJourney {
  journeyId: string
  originalTemplateId: string | null
}

export function setPendingGuestJourney(
  journeyId: string,
  originalTemplateId: string | null
): void {
  try {
    const data: PendingGuestJourney = { journeyId, originalTemplateId }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // sessionStorage may be unavailable (SSR, private browsing, etc.)
  }
}

export function getPendingGuestJourney(): PendingGuestJourney | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw == null) return null
    return JSON.parse(raw) as PendingGuestJourney
  } catch {
    return null
  }
}

export function clearPendingGuestJourney(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // sessionStorage may be unavailable
  }
}
