import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useJourneyUpdateMutation } from '../../../../../../libs/useJourneyUpdateMutation'
import { useCommand } from '@core/journeys/ui/CommandProvider'

export function WebsiteToggle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [journeyUpdate] = useJourneyUpdateMutation()
  const { add } = useCommand()

  async function handleChange(): Promise<void> {
    if (journey == null) return

    const currentMode = journey.website ?? false
    add({
      parameters: {
        execute: { currentMode },
        undo: { currentMode: !currentMode }
      },
      execute({ currentMode }) {
        void journeyUpdate({
          variables: {
            id: journey.id,
            input: { website: !currentMode }
          },
          optimisticResponse: {
            journeyUpdate: {
              id: journey.id,
              __typename: 'Journey',
              title: journey.title,
              description: journey.description,
              strategySlug: journey.strategySlug,
              language: journey.language,
              tags: [],
              website: !currentMode
            }
          }
        })
      }
    })

    // await journeyUpdate({
    //   variables: {
    //     id: journey.id,
    //     input: { website: !currentMode }
    //   },
    //   optimisticResponse: {
    //     journeyUpdate: {
    //       id: journey.id,
    //       __typename: 'Journey',
    //       title: journey.title,
    //       description: journey.description,
    //       strategySlug: journey.strategySlug,
    //       language: journey.language,
    //       tags: [],
    //       website: !currentMode
    //     }
    //   }
    // })
  }

  return (
    <ToggleButtonGroup
      value={journey?.website === true ? 'website' : 'journey'}
      exclusive
      onChange={handleChange}
    >
      <ToggleButton value="journey">{t('Journey')}</ToggleButton>
      <ToggleButton value="website">{t('Website')}</ToggleButton>
    </ToggleButtonGroup>
  )
}
