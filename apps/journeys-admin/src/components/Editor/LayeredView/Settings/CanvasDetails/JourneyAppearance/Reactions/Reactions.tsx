import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { GetJourney_journey } from '@core/journeys/ui/useJourneyQuery/__generated__/GetJourney'
import Share from '@core/shared/ui/icons/Share'

import { useJourneyUpdateMutation } from '../../../../../../../libs/useJourneyUpdateMutation'
import { Accordion } from '../../Properties/Accordion'

import { ReactionOption } from './ReactionOption'

export type ReactionFields = keyof Pick<
  GetJourney_journey,
  'showShareButton' | 'showLikeButton' | 'showDislikeButton'
>
export type UpdateReactionInput = { [key in ReactionFields]?: boolean }

export function Reactions(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [journeyUpdate] = useJourneyUpdateMutation()
  const { add } = useCommand()

  function handleToggle(input: UpdateReactionInput): void {
    if (journey == null) return

    const undoInput = Object.fromEntries(
      Object.entries(input).map(([key, value]) => [key, !value])
    )

    add({
      parameters: {
        execute: { input },
        undo: { input: undoInput }
      },
      execute({ input }) {
        void journeyUpdate({
          variables: {
            id: journey.id,
            input
          },
          optimisticResponse: {
            journeyUpdate: {
              ...journey,
              showShareButton: input.showShareButton ?? journey.showShareButton,
              showLikeButton: input.showLikeButton ?? journey.showLikeButton,
              showDislikeButton:
                input.showDislikeButton ?? journey.showDislikeButton
            }
          }
        })
      }
    })
  }

  return (
    <Accordion id="reactions" icon={<Share />} name={t('Reactions')}>
      <Stack sx={{ pb: 4 }} data-testid="Reactions">
        <ReactionOption
          title={t('Share')}
          active={journey?.showShareButton ?? true}
          field="showShareButton"
          handleToggle={handleToggle}
        />
        <ReactionOption
          title={t('Like')}
          active={journey?.showLikeButton ?? true}
          field="showLikeButton"
          handleToggle={handleToggle}
        />
        <ReactionOption
          title={t('Dislike')}
          active={journey?.showDislikeButton ?? true}
          field="showDislikeButton"
          handleToggle={handleToggle}
        />
      </Stack>
    </Accordion>
  )
}
