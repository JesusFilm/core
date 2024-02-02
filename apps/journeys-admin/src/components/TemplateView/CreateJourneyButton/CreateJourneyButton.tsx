import Button from '@mui/material/Button'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import TagManager from 'react-gtm-module'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'

interface CreateJourneyButtonProps {
  signedIn?: boolean
}

const DynamicCopyToTeamDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "CopyToTeamDialog" */
      '../../Team/CopyToTeamDialog'
    ).then((mod) => mod.CopyToTeamDialog)
)

export function CreateJourneyButton({
  signedIn = false
}: CreateJourneyButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const router = useRouter()
  const { journey } = useJourney()
  const [openTeamDialog, setOpenTeamDialog] = useState<boolean | undefined>()
  const [loadingJourney, setLoadingJourney] = useState(false)
  const [journeyDuplicate] = useJourneyDuplicateMutation()

  const handleCreateJourney = useCallback(
    async (teamId: string): Promise<void> => {
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
    },
    [journey, journeyDuplicate, router]
  )

  const handleCheckSignIn = (): void => {
    if (signedIn) {
      setOpenTeamDialog(true)
    } else {
      const url = window.location.origin + router.asPath
      void router.push(
        {
          pathname: '/users/sign-in',
          query: {
            redirect: url.includes('createNew')
              ? url
              : `${window.location.origin + router.asPath}?createNew=true`
          }
        },
        undefined,
        {
          shallow: true
        }
      )
    }
  }

  useEffect(() => {
    if (!signedIn) {
      // Prefetch the dashboard page
      void router.prefetch('/users/sign-in')
    }
    if (router.query.createNew === 'true' && signedIn) {
      setOpenTeamDialog(true)
    }
  }, [signedIn, router, handleCreateJourney])

  return (
    <>
      <Button
        onClick={handleCheckSignIn}
        variant="contained"
        sx={{ flex: 'none' }}
        disabled={journey == null}
        data-testid="CreateJourneyButton"
      >
        {t('Use This Template')}
      </Button>
      {openTeamDialog != null && (
        <DynamicCopyToTeamDialog
          submitLabel="Add"
          title="Add Journey to Team"
          open={openTeamDialog}
          loading={loadingJourney}
          onClose={() => setOpenTeamDialog(false)}
          submitAction={handleCreateJourney}
        />
      )}
    </>
  )
}
