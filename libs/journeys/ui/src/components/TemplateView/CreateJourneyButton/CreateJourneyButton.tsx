import Button from '@mui/material/Button'
import { sendGTMEvent } from '@next/third-parties/google'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useCallback, useEffect, useState } from 'react'

import { useJourney } from '../../../libs/JourneyProvider'
import { useJourneyDuplicateAndTranslate } from '../../../libs/useJourneyDuplicateAndTranslate'
import { AccountCheckDialog } from '../AccountCheckDialog'

interface CreateJourneyButtonProps {
  signedIn?: boolean
  openTeamDialog: boolean
  setOpenTeamDialog: React.Dispatch<React.SetStateAction<boolean>>
}

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
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

  const { duplicateAndTranslate, loading } = useJourneyDuplicateAndTranslate({
    journeyId: journey?.id,
    journeyTitle: journey?.title ?? '',
    journeyLanguageName:
      journey?.language.name.find(({ primary }) => primary)?.value ?? '',
    onSuccess: () => {
      setOpenTeamDialog(false)
    },
    onError: () => {
      setOpenTeamDialog(false)
    }
  })

  const handleCreateJourney = useCallback(
    async (
      teamId: string,
      selectedLanguage?: JourneyLanguage,
      showTranslation?: boolean
    ): Promise<void> => {
      if (journey == null) return

      const newJourneyId = await duplicateAndTranslate({
        teamId,
        selectedLanguage,
        shouldTranslate: showTranslation
      })

      if (newJourneyId != null) {
        sendGTMEvent({
          event: 'template_use',
          journeyId: journey.id,
          journeyTitle: journey.title
        })
        void router.push(`/journeys/${newJourneyId}`, undefined, {
          shallow: true
        })
      }
    },
    [journey, duplicateAndTranslate, router]
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

  function handleCloseTeamDialog() {
    if (setOpenTeamDialog !== undefined) {
      setOpenTeamDialog(false)
      const { createNew, ...queryWithoutCreateNew } = router.query
      void router.replace(
        {
          pathname: router.pathname,
          query: queryWithoutCreateNew
        },
        undefined,
        { shallow: true }
      )
    }
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
  }, [signedIn, router, setOpenTeamDialog])

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
          loading={loading}
          onClose={handleCloseTeamDialog}
          submitAction={handleCreateJourney}
        />
      )}
    </>
  )
}
