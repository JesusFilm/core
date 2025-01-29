import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { journeyUpdatedAtCacheUpdate } from '../../../../../../libs/journeyUpdatedAtCacheUpdate'
import { useJourneyUpdateMutation } from '../../../../../../libs/useJourneyUpdateMutation'

export function WebsiteToggle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [journeyUpdate] = useJourneyUpdateMutation()
  const { add } = useCommand()

  function handleChange(event, value): void {
    const currentMode =
      value === 'journey' ? false : value === 'website' ? true : null
    if (journey == null || currentMode == null) return

    add({
      parameters: {
        execute: { currentMode },
        undo: { currentMode: !currentMode }
      },
      execute({ currentMode }) {
        void journeyUpdate({
          variables: {
            id: journey.id,
            input: { website: currentMode }
          },
          optimisticResponse: {
            journeyUpdate: {
              ...journey,
              website: currentMode
            }
          },
          update(cache) {
            journeyUpdatedAtCacheUpdate(cache, journey.id)
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
          '&:first-of-type': {
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8
          },
          '&:last-of-type': {
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8
          },
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
