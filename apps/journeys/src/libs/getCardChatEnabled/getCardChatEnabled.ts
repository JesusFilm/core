import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import { GetJourney } from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import { createApolloClient } from '../apolloClient'
import { isJourneyNotFoundError } from '../isJourneyNotFoundError'
import { JOURNEY_STATUS_EXCLUDE_DRAFT } from '../journeyQueryOptions'
import { logger } from '../logger'

const apolloClient = createApolloClient()

/**
 * Hard ceiling for the per-message card lookup. Apollo has no default query
 * timeout, so without this a slow/hanging gateway would block every chat send
 * until the serverless function 504s. When it fires the request is aborted and
 * falls through to the fail-open path below.
 */
export const CARD_LOOKUP_TIMEOUT_MS = 5000

interface GetCardChatEnabledArgs {
  /** Journey database id from the chat request body. */
  journeyId?: string
  /** Active CardBlock id from the chat request body. */
  cardId: string
}

/**
 * Server-side per-card chat kill switch (NES-1679).
 *
 * Returns `true` only when the card identified by `cardId` exists inside the
 * journey identified by `journeyId` AND its `showAssistant` is explicitly
 * `true`. Looking the card up *within* the journey also enforces that the card
 * belongs to the journey in the request, so a stale tab can't keep chatting by
 * spoofing a different journeyId.
 *
 * Threat-model scope: this is a creator emergency stop, not a malicious-actor
 * defense. The check is still bounded by the client-supplied `cardId`, so a
 * viewer who knows another (un-killed) card id in the *same* journey could send
 * that instead and keep chatting on those cards — the killed card itself still
 * can't be re-enabled this way, which is what the switch guarantees. For a
 * journey-wide / global stop, the hammer is the LaunchDarkly `apologistChat`
 * flag, which disables chat everywhere at once.
 *
 * Freshness matters: the lookup uses `fetchPolicy: 'no-cache'` so flipping the
 * toggle off in the editor stops chat for already-open tabs on their next
 * message — an in-memory Apollo cache would otherwise mask the change.
 *
 * Failure policy:
 * - Definitive negatives (missing journeyId, journey not found, card not in the
 *   journey, `showAssistant !== true`) → `false` (fail closed). This is the
 *   kill switch doing its job.
 * - Infrastructure errors (gateway unreachable, 5xx, timeout) → `true` (fail
 *   open) and logged. The lookup runs on every message, so failing closed here
 *   would couple chat availability to a per-request gateway read and let a
 *   transient blip take down chat on every journey at once.
 */
export async function getCardChatEnabled({
  journeyId,
  cardId
}: GetCardChatEnabledArgs): Promise<boolean> {
  if (journeyId == null || journeyId === '') return false

  // Abort a hung lookup so it fails fast into the fail-open path instead of
  // holding the request open until the serverless function times out.
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), CARD_LOOKUP_TIMEOUT_MS)

  try {
    const { data } = await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: journeyId,
        idType: IdType.databaseId,
        options: { status: JOURNEY_STATUS_EXCLUDE_DRAFT }
      },
      // Always hit the gateway: a cached value would defeat the kill switch.
      fetchPolicy: 'no-cache',
      context: { fetchOptions: { signal: controller.signal } }
    })

    const card = data.journey?.blocks?.find(
      (block) => block.__typename === 'CardBlock' && block.id === cardId
    )

    return card?.__typename === 'CardBlock' && card.showAssistant === true
  } catch (error) {
    // A genuinely missing journey is a definitive negative → fail closed.
    if (isJourneyNotFoundError(error)) return false
    // Infrastructure error (gateway unreachable, 5xx, abort/timeout) → fail
    // open so a transient gateway blip doesn't kill chat on every journey at
    // once.
    const err = error as Error
    logger.warn(
      {
        event: 'chat_card_lookup_error',
        journeyId,
        cardId,
        name: err?.name,
        message: err?.message
      },
      '[chat] card showAssistant lookup failed — allowing chat (fail open)'
    )
    return true
  } finally {
    clearTimeout(timeout)
  }
}
