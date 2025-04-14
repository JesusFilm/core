import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Type3 from '@core/shared/ui/icons/Type3'

import { useJourneyUpdateMutation } from '../../../../../../../libs/useJourneyUpdateMutation'
import { TextFieldForm } from '../../../../../../TextFieldForm'
import { Accordion } from '../../Properties/Accordion'
import { useToggleJourneyProperty } from '../libs/useToggleJourneyProperty'

export function DisplayTitle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { add } = useCommand()
  const [journeyUpdate] = useJourneyUpdateMutation()
  const [checked, toggleProperty] = useToggleJourneyProperty('showDisplayTitle')

  async function handleUpdate(newTitle: string): Promise<void> {
    if (journey == null) return

    const undoDisplayTitle = journey.displayTitle
    add({
      parameters: {
        execute: { displayTitle: newTitle },
        undo: { displayTitle: undoDisplayTitle }
      },
      execute({ displayTitle }) {
        void journeyUpdate({
          variables: {
            id: journey.id,
            input: {
              displayTitle
            }
          },
          optimisticResponse: {
            journeyUpdate: {
              ...journey,
              tags: [],
              displayTitle
            }
          }
        })
      }
    })
  }

  return (
    <Accordion
      id="display title"
      icon={<Type3 />}
      name={t('Display Title')}
      switchProps={{
        handleToggle: (e) => toggleProperty(e.target.checked),
        checked
      }}
    >
      <Stack sx={{ p: 4, pt: 2 }} data-testid="DisplayTitle">
        <TextFieldForm
          id="display-title"
          initialValue={journey?.displayTitle ?? journey?.seoTitle ?? ''}
          onSubmit={handleUpdate}
          label={t('Display Title')}
        />
      </Stack>
    </Accordion>
  )
}
