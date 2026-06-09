import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import { GetJourney } from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import { createApolloClient } from '../apolloClient'
import { isJourneyNotFoundError } from '../isJourneyNotFoundError'
import { JOURNEY_STATUS_EXCLUDE_DRAFT } from '../journeyQueryOptions'
import { logger } from '../logger'

const apolloClient = createApolloClient()

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
 * - Infrastructure errors (gateway unreachable, 5xx) → `true` (fail open) and
 *   logged. The lookup runs on every message, so failing closed here would
 *   couple chat availability to a per-request gateway read and let a transient
 *   blip take down chat on every journey at once.
 */
export async function getCardChatEnabled({
  journeyId,
  cardId
}: GetCardChatEnabledArgs): Promise<boolean> {
  if (journeyId == null || journeyId === '') return false

  try {
    const { data } = await apolloClient.query<GetJourney>({
      query: GET_JOURNEY,
      variables: {
        id: journeyId,
        idType: IdType.databaseId,
        options: { status: JOURNEY_STATUS_EXCLUDE_DRAFT }
      },
      // Always hit the gateway: a cached value would defeat the kill switch.
      fetchPolicy: 'no-cache'
    })

    const found = data.journey?.blocks?.find(
      (block) => block.__typename === 'CardBlock' && block.id === cardId
    )
    const cardBlock = found?.__typename === 'CardBlock' ? found : undefined
    const enabled = cardBlock?.showAssistant === true

    // Observability for the allow path. The kill switch already logs when it
    // blocks (`chat_card_disabled`) and when it errors (`chat_card_lookup_error`),
    // but not what it read when it *allows* — so a "killed card still chatting"
    // report can't be localised. Record exactly what the gateway returned:
    // whether the journey/card were found and the resolved `showAssistant`, so
    // a stale read (cardFound + showAssistant !== false) can be told apart from
    // a request-identity mismatch (journeyFound/cardFound false).
    logger.info(
      {
        event: 'chat_card_lookup',
        journeyId,
        cardId,
        journeyFound: data.journey != null,
        cardFound: cardBlock != null,
        showAssistant: cardBlock?.showAssistant ?? null,
        enabled
      },
      '[chat] card showAssistant lookup result'
    )

    return enabled
  } catch (error) {
    // A genuinely missing journey is a definitive negative → fail closed.
    if (isJourneyNotFoundError(error)) return false
    // Infrastructure error → fail open so a transient gateway blip doesn't kill
    // chat on every journey at once.
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
  }
}
