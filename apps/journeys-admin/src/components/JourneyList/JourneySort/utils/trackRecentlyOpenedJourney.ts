const RECENTLY_OPENED_JOURNEY_KEY = 'journeys-admin-recently-opened-journey'

interface RecentlyOpenedJourneyRecord {
  journeyId: string
  openedAt: number
}

function parseStoredJourney(
  value: string | null
): RecentlyOpenedJourneyRecord | null {
  if (value == null) return null

  try {
    const parsed = JSON.parse(value) as Partial<RecentlyOpenedJourneyRecord>
    if (typeof parsed.journeyId !== 'string') return null
    if (typeof parsed.openedAt !== 'number') return null

    return { journeyId: parsed.journeyId, openedAt: parsed.openedAt }
  } catch {
    return null
  }
}

export function trackRecentlyOpenedJourney(journeyId: string): void {
  if (journeyId.trim() === '') return
  if (typeof window === 'undefined') return

  const payload: RecentlyOpenedJourneyRecord = {
    journeyId,
    openedAt: Date.now()
  }

  try {
    localStorage.setItem(RECENTLY_OPENED_JOURNEY_KEY, JSON.stringify(payload))
  } catch {
    return
  }
}

export function getRecentlyOpenedJourney(): RecentlyOpenedJourneyRecord | null {
  if (typeof window === 'undefined') return null

  try {
    const storedValue = localStorage.getItem(RECENTLY_OPENED_JOURNEY_KEY)
    return parseStoredJourney(storedValue)
  } catch {
    return null
  }
}
