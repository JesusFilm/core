import { CombinedGraphQLErrors } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import {
  CampaignJourneyBlockUpdateText,
  CampaignJourneyBlockUpdateTextVariables
} from '../../../../../__generated__/CampaignJourneyBlockUpdateText'
import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { IdType } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_JOURNEY_BLOCK_UPDATE_TEXT } from '../../../../libs/useCampaignBlockTextMutation'
import { useCampaignJourneyBlockSnapshotRefreshMutation } from '../../../../libs/useCampaignJourneyBlockSnapshotRefreshMutation'
import { useCampaignJourneyByLinkLazyQuery } from '../../../../libs/useCampaignJourneyByLinkLazyQuery'
import { useCampaignEditor } from '../../CampaignEditorProvider'

import { SnapshotRefreshDialog } from './SnapshotRefreshDialog'

export type JourneyCardBlock = Extract<
  CampaignBlock,
  { __typename: 'CampaignJourneyBlock' }
>

interface SnapshotText {
  title: string | null
  description: string | null
}

/** The caps the API cuts a snapshot to, so an untouched card compares equal to its journey. */
const TITLE_CAP = 200
const DESCRIPTION_CAP = 1000

function cut(value: string, max: number): string {
  return [...value].slice(0, max).join('')
}

/** The default-language values the API would snapshot from a journey. */
export function snapshotOf(journey: {
  title: string
  description?: string | null
}): SnapshotText {
  return {
    title: cut(journey.title, TITLE_CAP),
    description:
      journey.description == null
        ? null
        : cut(journey.description, DESCRIPTION_CAP)
  }
}

/**
 * Whether the card's snapshot differs from the journey's current text: an
 * edit the author made (or a change the journey has had since), either of
 * which a refresh would overwrite. Empty and missing descriptions are the same.
 */
export function isSnapshotEdited(
  card: Pick<JourneyCardBlock, 'title' | 'description'>,
  journey: SnapshotText
): boolean {
  return (
    (card.title ?? '') !== (journey.title ?? '') ||
    (card.description ?? '') !== (journey.description ?? '')
  )
}

interface RefreshParameters {
  mode: 'refresh' | 'restore'
  text: SnapshotText
}

function messageOf(error: unknown, fallback: string): string {
  if (CombinedGraphQLErrors.is(error) && error.errors[0] != null)
    return error.errors[0].message
  return error instanceof Error ? error.message : fallback
}

/**
 * "Refresh from journey" on a journey-list item. It re-reads the journey's
 * title and description; when they differ from the card's (the author edited
 * the snapshot) it asks before replacing them, otherwise there is nothing to
 * do. The replacement is one Command: execute writes the journey's text
 * through `campaignJourneyBlockSnapshotRefresh` (default language only,
 * translations kept) and undo writes the text the card had back through
 * `campaignJourneyBlockUpdate`.
 */
export function useSnapshotRefreshCommand(): {
  refreshSnapshot: (card: JourneyCardBlock) => Promise<void>
  confirmDialog: ReactElement
} {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { add } = useCommand()
  const {
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const [lookup] = useCampaignJourneyByLinkLazyQuery()
  const [refresh] = useCampaignJourneyBlockSnapshotRefreshMutation()
  const [update] = useMutation<
    CampaignJourneyBlockUpdateText,
    CampaignJourneyBlockUpdateTextVariables
  >(CAMPAIGN_JOURNEY_BLOCK_UPDATE_TEXT)
  const [pending, setPending] = useState<{
    card: JourneyCardBlock
    journey: SnapshotText
  } | null>(null)

  function notify(error: unknown, fallback: string): void {
    enqueueSnackbar(messageOf(error, fallback), {
      variant: 'error',
      preventDuplicate: true
    })
  }

  function addRefreshCommand(
    card: JourneyCardBlock,
    journey: SnapshotText
  ): void {
    const cardPageKind = pageKindOf(card) ?? pageKind
    const before: SnapshotText = {
      title: card.title,
      description: card.description
    }

    function run({ mode, text }: RefreshParameters): void {
      dispatch({
        type: 'SetEditorFocusAction',
        pageKind: cardPageKind,
        selectedBlockId: card.id
      })
      const optimistic = {
        __typename: 'CampaignJourneyBlock' as const,
        id: card.id,
        ...text
      }
      const request =
        mode === 'refresh'
          ? refresh({
              variables: { id: card.id },
              optimisticResponse: {
                campaignJourneyBlockSnapshotRefresh: optimistic
              }
            })
          : update({
              variables: { id: card.id, input: text },
              optimisticResponse: { campaignJourneyBlockUpdate: optimistic }
            })
      void request.catch((error: unknown) =>
        notify(error, t('Could not refresh from journey'))
      )
    }

    add<RefreshParameters>({
      parameters: {
        execute: { mode: 'refresh', text: journey },
        undo: { mode: 'restore', text: before }
      },
      execute: run
    })
  }

  async function refreshSnapshot(card: JourneyCardBlock): Promise<void> {
    if (card.journeyId == null) return
    try {
      const { data, error } = await lookup({
        variables: { id: card.journeyId, idType: IdType.databaseId }
      })
      if (error != null || data?.journey == null) {
        notify(error, t('Journey not found or not published'))
        return
      }
      const journey = snapshotOf(data.journey)
      if (!isSnapshotEdited(card, journey)) {
        enqueueSnackbar(t('Already matches the journey'), { variant: 'info' })
        return
      }
      setPending({ card, journey })
    } catch (error) {
      notify(error, t('Journey not found or not published'))
    }
  }

  const confirmDialog = (
    <SnapshotRefreshDialog
      open={pending != null}
      onClose={() => setPending(null)}
      onConfirm={() => {
        if (pending != null) addRefreshCommand(pending.card, pending.journey)
        setPending(null)
      }}
    />
  )

  return { refreshSnapshot, confirmDialog }
}
