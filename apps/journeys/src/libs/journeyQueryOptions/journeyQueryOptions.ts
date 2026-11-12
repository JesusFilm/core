import { JourneyStatus } from '../../../__generated__/globalTypes'

/**
 * Status filter for public journey queries: all statuses except draft.
 * Publication provenance is enforced by the API for inactive journeys.
 */
export const JOURNEY_STATUS_EXCLUDE_DRAFT: JourneyStatus[] = [
  JourneyStatus.published,
  JourneyStatus.archived,
  JourneyStatus.trashed,
  JourneyStatus.deleted
]

// Public ISR/page-data generation must fail closed if an old upstream or a
// stale response ever supplies a draft despite the server-owned read policy.
export function requirePublicJourney(journey: { status: JourneyStatus }): void {
  if (journey.status === JourneyStatus.draft) {
    throw new Error('journey not found')
  }
}
