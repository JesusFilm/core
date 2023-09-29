import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'
import { CopyToTeamDialog } from '../../Team/CopyToTeamDialog'

interface UseTemplateButtonProps {
  signedIn: boolean
}

export function UseTemplateButton({
  signedIn
}: UseTemplateButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { journey } = useJourney()
  const [openTeamDialog, setOpenTeamDialog] = useState(false)
  const [loadingJourney, setLoadingJourney] = useState(false)
  const [journeyDuplicate] = useJourneyDuplicateMutation()

  useEffect(() => {
    if (!signedIn) {
      // Prefetch the dashboard page
      void router.prefetch('/users/sign-in')
    }
  }, [signedIn, router])

  useEffect(() => {
    console.log('router', router.query)
    if (router.query.createNew === 'true') {
      setOpenTeamDialog(true)
    }
  }, [router])

  const handleCreateJourney = async (teamId: string): Promise<void> => {
    if (journey == null) return

    setLoadingJourney(true)

    const { data } = await journeyDuplicate({
      variables: { id: journey.id, teamId }
    })

    if (data != null) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'template_use',
          journeyId: journey.id,
          journeyTitle: journey.title
        }
      })
      void router
        .push(`/journeys/${data.journeyDuplicate.id}`, undefined, {
          shallow: true
        })
        .finally(() => {
          setLoadingJourney(false)
        })
    } else {
      setLoadingJourney(false)
    }
  }

  const handleCheckSignIn = (): void => {
    if (signedIn) {
      setOpenTeamDialog(true)
    } else {
      console.log('router check sign in', router.asPath)
      void router
        .push(
          `/users/sign-in?redirect=${
            window.location.origin + router.asPath
          }?createNew=true`,
          undefined,
          {
            shallow: true
          }
        )
        .then(() => {
          setOpenTeamDialog(true)
        })
    }
  }
  return (
    <>
      <Button onClick={handleCheckSignIn} variant="contained">
        {t('Use Template')}
      </Button>
      <CopyToTeamDialog
        submitLabel="Add"
        title="Add Journey to Team"
        open={openTeamDialog}
        loading={loadingJourney}
        onClose={() => setOpenTeamDialog(false)}
        submitAction={handleCreateJourney}
      />
    </>
  )
}
