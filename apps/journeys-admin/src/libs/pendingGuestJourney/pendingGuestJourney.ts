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
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed == null ||
      typeof (parsed as Record<string, unknown>).journeyId !== 'string'
    ) {
      return null
    }
    const obj = parsed as Record<string, unknown>
    return {
      journeyId: obj.journeyId as string,
      originalTemplateId:
        typeof obj.originalTemplateId === 'string'
          ? obj.originalTemplateId
          : null
    }
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
