import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useFlags } from '@core/shared/ui/FlagsProvider'
import Plus2 from '@core/shared/ui/icons/Plus2'

import { useJourneyCreate } from '../../../../libs/useJourneyCreate'
import { useTeam } from '../../../Team/TeamProvider'

export function AddJourneyButton(): ReactElement {
  const { createJourney } = useJourneyCreate()
  const router = useRouter()
  const { activeTeam } = useTeam()
  const { t } = useTranslation('apps-journeys-admin')
  const { teams } = useFlags()

  const handleClick = async (): Promise<void> => {
    const journey = await createJourney()
    if (journey != null) {
      void router.push(`/journeys/${journey.id}/edit`, undefined, {
        shallow: true
      })
    }
  }

  return (
    <>
      {(!teams || activeTeam != null) && (
        <Button
          variant="contained"
          startIcon={<Plus2 />}
          size="medium"
          onClick={handleClick}
          sx={{ mt: 3, alignSelf: 'center' }}
        >
          {t('Create a Journey')}
        </Button>
      )}
    </>
  )
}
