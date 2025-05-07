import Button from '@mui/material/Button'
import { sendGTMEvent } from '@next/third-parties/google'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { type ReactElement, useCallback, useEffect, useState } from 'react'

import { convertLanguagesToOptions } from '@core/shared/ui/LanguageAutocomplete/utils/convertLanguagesToOptions'
import { useJourneyAiTranslateMutation } from '@core/journeys/ui/useJourneyAiTranslateMutation'

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
  const { enqueueSnackbar } = useSnackbar()
  const { translateJourney } = useJourneyAiTranslateMutation()
  const journeyLanguage = journey?.language
    ? convertLanguagesToOptions([journey.language])[0]
    : undefined

  const handleCreateJourney = useCallback(
    async (teamId: string, languageId: string): Promise<void> => {
      if (journey == null || languageId == '') return

      setLoadingJourney(true)

      try {
        const { data } = await journeyDuplicate({
          variables: { id: journey.id, teamId }
        })

        // Check if duplication was successful
        if (data?.journeyDuplicate?.id) {
          sendGTMEvent({
            event: 'template_use',
            journeyId: journey.id,
            journeyTitle: journey.title
          })

          console.log('languageId', languageId)
          // Use the duplicated journey ID for translation
          const translatedJourney = await translateJourney({
            journeyId: data.journeyDuplicate.id,
            name: `${journey.title}`,
            textLanguageId: languageId,
            videoLanguageId: null // Optional
          })

          if (translatedJourney) {
            enqueueSnackbar(t('Translation Finished'), {
              variant: 'success'
            })

            setOpenTeamDialog(false)

            void router.push(
              `/journeys/${data.journeyDuplicate.id}`,
              undefined,
              {
                shallow: true
              }
            )
          } else {
            throw new Error('Failed to start translation')
          }
        } else {
          throw new Error('Journey duplication failed')
        }
      } catch (error) {
        console.error('Error in translation process:', error)
        enqueueSnackbar(
          t('Failed to process translation request. Please try again.'),
          {
            variant: 'error'
          }
        )
      } finally {
        setLoadingJourney(false)
      }
    },

    [journey, journeyDuplicate, router, t, enqueueSnackbar, translateJourney]
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
          journeyLanguage={journeyLanguage}
          onClose={() =>
            setOpenTeamDialog !== undefined && setOpenTeamDialog(false)
          }
          submitAction={handleCreateJourney}
        />
      )}
    </>
  )
}
