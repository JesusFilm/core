import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import {
  TEXT_CAPS,
  truncate
} from '@core/journeys/ui/Campaign/libs/translatedField'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { IdType } from '../../../../../__generated__/globalTypes'
import { useCampaignBlockUpdateMutation } from '../../../../libs/useCampaignBlockUpdateMutation'
import { useCampaignJourneyBlockSnapshotRefreshMutation } from '../../../../libs/useCampaignJourneyBlockSnapshotRefreshMutation'
import { useCampaignJourneyByLinkLazyQuery } from '../../../../libs/useCampaignJourneyByLinkLazyQuery'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

export type JourneyCardBlock = Extract<
  CampaignBlock,
  { __typename: 'CampaignJourneyBlock' }
>

interface SnapshotText {
  title: string | null
  description: string | null
}

export interface CampaignJourneyBlockSnapshotRefreshCommand {
  /** Refresh at once, or hold the card for confirmation when the author edited its snapshot. */
  refreshSnapshot: (card: JourneyCardBlock) => Promise<void>
  /** The card whose refresh awaits the author's confirmation. */
  pending?: JourneyCardBlock
  confirmRefresh: () => void
  cancelRefresh: () => void
}

/**
 * The default-language values the API would snapshot from a journey: cut to
 * the caps it cuts a snapshot to, so an untouched card compares equal to its
 * journey.
 */
export function snapshotOf(journey: {
  title: string
  description?: string | null
}): SnapshotText {
  return {
    title: truncate(journey.title, TEXT_CAPS.journeyTitle),
    description:
      journey.description == null
        ? null
        : truncate(journey.description, TEXT_CAPS.journeyDescription)
  }
}

/**
 * Whether the card's snapshot already reads as the journey's current text, so
 * a refresh would change nothing. Empty and missing descriptions are the same.
 */
export function matchesJourney(
  card: Pick<JourneyCardBlock, 'title' | 'description'>,
  journey: SnapshotText
): boolean {
  return (
    (card.title ?? '') === (journey.title ?? '') &&
    (card.description ?? '') === (journey.description ?? '')
  )
}

/**
 * "Refresh from journey" on a journey-list item. It re-reads the journey's
 * title and description and replaces the card's with them, asking first only
 * when the author edited the snapshot by hand (the card's `snapshotEdited`;
 * a journey renamed since linking does not count). A card that already reads
 * as the journey has nothing to refresh, whatever its edited flag says (an
 * undone edit leaves it set), so that case only clears the flag. The replacement is one Command:
 * execute writes the journey's text through
 * `campaignJourneyBlockSnapshotRefresh` (default language only, translations
 * kept, edited flag cleared) and undo writes the text and flag the card had
 * back through `campaignJourneyBlockUpdate`. A refusal shows in the
 * editor's error snackbar: the API's message, else "Could not refresh from
 * journey".
 */
export function useCampaignJourneyBlockSnapshotRefreshCommand(): CampaignJourneyBlockSnapshotRefreshCommand {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { addCampaignCommand } = useCampaignCommand()
  const reportFailure = useCommandFailure()
  const [lookup] = useCampaignJourneyByLinkLazyQuery()
  const [refresh] = useCampaignJourneyBlockSnapshotRefreshMutation()
  const { update } = useCampaignBlockUpdateMutation()
  const [pending, setPending] = useState<{
    card: JourneyCardBlock
    journey: SnapshotText
  } | null>(null)

  function addRefreshCommand(
    card: JourneyCardBlock,
    journey: SnapshotText
  ): void {
    const before: SnapshotText = {
      title: card.title,
      description: card.description
    }
    addCampaignCommand({
      execute: async () =>
        await refresh({
          variables: { id: card.id },
          optimisticResponse: {
            campaignJourneyBlockSnapshotRefresh: {
              __typename: 'CampaignJourneyBlock',
              id: card.id,
              ...journey,
              snapshotEdited: false
            }
          }
        }),
      undo: async () =>
        await update(card, { ...before, snapshotEdited: card.snapshotEdited })
    }).catch((error: unknown) =>
      reportFailure(error, t('Could not refresh from journey'))
    )
  }

  /**
   * An edit undone (or retyped) back to the journey's text leaves the flag
   * set; clearing it keeps a later journey rename from asking to confirm.
   * Nothing visible changes, so it is not a Command.
   */
  function clearEditedFlag(
    card: JourneyCardBlock,
    journey: SnapshotText
  ): void {
    void refresh({
      variables: { id: card.id },
      optimisticResponse: {
        campaignJourneyBlockSnapshotRefresh: {
          __typename: 'CampaignJourneyBlock',
          id: card.id,
          ...journey,
          snapshotEdited: false
        }
      }
    }).catch((error: unknown) =>
      reportFailure(error, t('Could not refresh from journey'))
    )
  }

  async function refreshSnapshot(card: JourneyCardBlock): Promise<void> {
    if (card.journeyId == null) return
    try {
      const { data, error } = await lookup({
        variables: { id: card.journeyId, idType: IdType.databaseId }
      })
      if (error != null || data?.journey == null) {
        reportFailure(error, t('Journey not found or not published'))
        return
      }
      const journey = snapshotOf(data.journey)
      if (matchesJourney(card, journey)) {
        enqueueSnackbar(t('Already matches the journey'), { variant: 'info' })
        if (card.snapshotEdited) clearEditedFlag(card, journey)
        return
      }
      if (card.snapshotEdited) {
        setPending({ card, journey })
        return
      }
      addRefreshCommand(card, journey)
    } catch (error) {
      reportFailure(error, t('Journey not found or not published'))
    }
  }

  function confirmRefresh(): void {
    if (pending != null) addRefreshCommand(pending.card, pending.journey)
    setPending(null)
  }

  function cancelRefresh(): void {
    setPending(null)
  }

  return {
    refreshSnapshot,
    pending: pending?.card,
    confirmRefresh,
    cancelRefresh
  }
}
