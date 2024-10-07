import Button from '@mui/material/Button'
import { sendGTMEvent } from '@next/third-parties/google'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useCallback, useEffect, useState } from 'react'

import { useJourney } from '../../../libs/JourneyProvider'
import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'
import { AccountCheckDialog } from '../AccountCheckDialog'

interface CreateJourneyButtonProps {
  signedIn?: boolean
  openTeamDialog: boolean
  setOpenTeamDialog: React.Dispatch<React.SetStateAction<boolean>>
}

const DynamicCopyToTeamDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "CopyToTeamDialog" */
      '../../CopyToTeamDialog'
    ).then((mod) => mod.CopyToTeamDialog)
)

export function CreateJourneyButton({
  signedIn = false,
  openTeamDialog,
  setOpenTeamDialog
}: CreateJourneyButtonProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const router = useRouter()
  const { journey } = useJourney()
  const [openAccountDialog, setOpenAccountDialog] = useState(false)
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
        sendGTMEvent({
          event: 'template_use',
          journeyId: journey.id,
          journeyTitle: journey.title
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
    if (signedIn && setOpenTeamDialog !== undefined) {
      setOpenTeamDialog(true)
    } else {
      setOpenAccountDialog(true)
    }
  }

  const handleSignIn = (login: boolean): void => {
    // Use env var if outside journeys-admin project
    const domain =
      process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? window.location.origin
    const url = `${domain}/templates/${journey?.id ?? ''}`

    void router.push(
      {
        pathname: `${domain}/users/sign-in`,
        query: {
          redirect: url.includes('createNew') ? url : `${url}?createNew=true`,
          login: login ?? false
        }
      },
      undefined,
      {
        shallow: true
      }
    )
  }

  useEffect(() => {
    if (!signedIn) {
      // Prefetch the dashboard page
      void router.prefetch('/users/sign-in')
    }
    if (
      router.query.createNew === 'true' &&
      signedIn &&
      setOpenTeamDialog !== undefined
    ) {
      setOpenTeamDialog(true)
    }
  }, [signedIn, router, handleCreateJourney, setOpenTeamDialog])

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
      <AccountCheckDialog
        open={openAccountDialog}
        handleSignIn={handleSignIn}
        onClose={() => setOpenAccountDialog(false)}
      />
      {openTeamDialog != null && (
        <DynamicCopyToTeamDialog
          submitLabel={t('Add')}
          title={t('Add Journey to Team')}
          open={openTeamDialog}
          loading={loadingJourney}
          onClose={() =>
            setOpenTeamDialog !== undefined && setOpenTeamDialog(false)
          }
          submitAction={handleCreateJourney}
        />
      )}
    </>
  )
}
