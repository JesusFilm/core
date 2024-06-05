import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { useJourneyCreateMutation } from '../../../../libs/useJourneyCreateMutation'

export function AddJourneyButton(): ReactElement {
  const { createJourney } = useJourneyCreateMutation()
  const router = useRouter()
  const { activeTeam } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')

  const handleClick = async (): Promise<void> => {
    const journey = await createJourney()
    if (journey != null) {
      void router.push(`/journeys/${journey.id}`, undefined, {
        shallow: true
      })
    }
  }

  return (
    <>
      {activeTeam != null && (
        <Button
          variant="contained"
          startIcon={<Plus2Icon />}
          size="medium"
          onClick={handleClick}
          sx={{ mt: 3, alignSelf: 'center' }}
          data-testid="AddJourneyButton"
        >
          {t('Create a Journey')}
        </Button>
      )}
    </>
  )
}
