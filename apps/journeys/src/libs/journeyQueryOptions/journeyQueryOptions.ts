import { JourneyStatus } from '../../../__generated__/globalTypes'

/**
 * Status filter for public journey queries: all statuses except draft.
 * Used so the journeys app never shows draft journeys.
 */
export const JOURNEY_STATUS_EXCLUDE_DRAFT: JourneyStatus[] = [
  JourneyStatus.published,
  JourneyStatus.archived,
  JourneyStatus.trashed,
  JourneyStatus.deleted
]
