import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useJourneyUpdateMutation } from '../../../../../../libs/useJourneyUpdateMutation'

export function WebsiteToggle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [journeyUpdate] = useJourneyUpdateMutation()
  const { add } = useCommand()

  function handleChange(): void {
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
              ...journey,
              website: !currentMode
            }
          }
        })
      }
    })
  }

  return (
    <ToggleButtonGroup
      value={journey?.website === true ? 'website' : 'journey'}
      exclusive
      onChange={handleChange}
      fullWidth
      sx={{
        p: 4,
        '& .MuiToggleButton-root': {
          borderRadius: '8px',
          '&.Mui-selected': {
            color: 'primary.main'
          }
        }
      }}
    >
      <ToggleButton value="journey">{t('Journey')}</ToggleButton>
      <ToggleButton value="website">{t('Website')}</ToggleButton>
    </ToggleButtonGroup>
  )
}
