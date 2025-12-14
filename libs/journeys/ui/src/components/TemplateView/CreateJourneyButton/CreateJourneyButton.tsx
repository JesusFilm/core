import Button from '@mui/material/Button'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import { sendGTMEvent } from '@next/third-parties/google'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { type ReactElement, useCallback, useEffect, useState } from 'react'

import LayoutTopIcon from '@core/shared/ui/icons/LayoutTop'

import { useJourney } from '../../../libs/JourneyProvider'
import { useJourneyAiTranslateSubscription } from '../../../libs/useJourneyAiTranslateSubscription'
import { useJourneyDuplicateMutation } from '../../../libs/useJourneyDuplicateMutation'
import { AccountCheckDialog } from '../AccountCheckDialog'

interface CreateJourneyButtonProps {
  variant?: 'menu-item' | 'button'
  signedIn?: boolean
  /* Automatically open the team dialog when the user signs in with createNew=true in the URL.
   * Only one CreateJourneyButton per page should have this set to true to avoid opening multiple instances of the dialog.
   */
  openTeamDialogOnSignIn?: boolean
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
  variant = 'button',
  signedIn = false,
  openTeamDialogOnSignIn = false
}: CreateJourneyButtonProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { enqueueSnackbar } = useSnackbar()

  const router = useRouter()
  const { journey } = useJourney()
  const [openAccountDialog, setOpenAccountDialog] = useState(false)
  const [openTeamDialog, setOpenTeamDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [translationVariables, setTranslationVariables] = useState<
    | {
        journeyId: string
        name: string
        journeyLanguageName: string
        textLanguageId: string
        textLanguageName: string
      }
    | undefined
  >(undefined)
  const [pendingNavigationId, setPendingNavigationId] = useState<string | null>(
    null
  )

  const [journeyDuplicate] = useJourneyDuplicateMutation()

  // Set up the subscription for translation
  const { data: translationData } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    skip: !translationVariables,
    onComplete: () => {
      enqueueSnackbar(t('Journey Translated'), {
        variant: 'success',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined)
      setOpenTeamDialog(false)

      // Navigate to the translated journey
      if (pendingNavigationId) {
        if (journey) {
          sendGTMEvent({
            event: 'template_use',
            journeyId: journey.id,
            journeyTitle: journey.title
          })
        }
        void router.push(`/journeys/${pendingNavigationId}`, undefined, {
          shallow: true
        })
        setPendingNavigationId(null)
      }
    },
    onError(error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined)
      setOpenTeamDialog(false)
      setPendingNavigationId(null)
    }
  })

  const handleCreateJourney = useCallback(
    async (
      teamId: string,
      selectedLanguage?: JourneyLanguage,
      showTranslation?: boolean
    ): Promise<void> => {
      if (journey == null) return

      setLoading(true)

      try {
        const { data: duplicateData } = await journeyDuplicate({
          variables: { id: journey.id, teamId, forceNonTemplate: true }
        })

        if (!duplicateData?.journeyDuplicate?.id) {
          throw new Error('Journey duplication failed')
        }

        const newJourneyId = duplicateData.journeyDuplicate.id

        if (selectedLanguage == null || !showTranslation) {
          // No translation needed - navigate immediately
          setLoading(false)
          enqueueSnackbar(t('Journey Copied'), {
            variant: 'success',
            preventDuplicate: true
          })
          setOpenTeamDialog(false)

          sendGTMEvent({
            event: 'template_use',
            journeyId: journey.id,
            journeyTitle: journey.title
          })
          void router.push(`/journeys/${newJourneyId}`, undefined, {
            shallow: true
          })
          return
        }

        // Translation needed - set up subscription and wait
        setPendingNavigationId(newJourneyId)
        setTranslationVariables({
          journeyId: newJourneyId,
          name: journey.title,
          journeyLanguageName:
            journey.language.name.find(({ primary }) => !primary)?.value ?? '',
          textLanguageId: selectedLanguage.id,
          textLanguageName:
            selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
        })

        // Don't close dialog or navigate yet - wait for translation to complete
      } catch (error) {
        setLoading(false)
        enqueueSnackbar(t('Journey duplication failed'), {
          variant: 'error',
          preventDuplicate: true
        })
        setOpenTeamDialog(false)
      }
    },
    [journey, journeyDuplicate, router, t, enqueueSnackbar]
  )

  const handleCheckSignIn = (): void => {
    // For menu-item variant, assume user is signed in
    if (variant === 'menu-item' || signedIn) {
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
    // Prevent closing during translation
    if (loading || translationVariables != null) return

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

  useEffect(() => {
    if (!signedIn && variant === 'button') {
      // Prefetch the dashboard page
      void router.prefetch('/users/sign-in')
    }
    if (
      router.query.createNew === 'true' &&
      signedIn &&
      openTeamDialogOnSignIn
    ) {
      setOpenTeamDialog(true)
    }
  }, [signedIn, router, openTeamDialogOnSignIn, variant])

  const renderTrigger = (): ReactElement => {
    if (variant === 'menu-item') {
      return (
        <MenuItem
          onClick={handleCheckSignIn}
          data-testid="CreateJourneyMenuItem"
        >
          <ListItemIcon sx={{ color: 'secondary.main' }}>
            <LayoutTopIcon />
          </ListItemIcon>
          <ListItemText>{t('Use This Template')}</ListItemText>
        </MenuItem>
      )
    }

    return (
      <Button
        onClick={handleCheckSignIn}
        variant="contained"
        sx={{ flex: 'none' }}
        disabled={journey == null}
        data-testid="CreateJourneyButton"
      >
        {t('Use This Template')}
      </Button>
    )
  }

  return (
    <>
      {renderTrigger()}
      {variant === 'button' && (
        <AccountCheckDialog
          open={openAccountDialog}
          handleSignIn={handleSignIn}
          onClose={() => setOpenAccountDialog(false)}
        />
      )}
      {openTeamDialog != null && (
        <DynamicCopyToTeamDialog
          submitLabel={t('Add')}
          title={t('Add Journey to Team')}
          open={openTeamDialog}
          loading={loading}
          onClose={handleCloseTeamDialog}
          submitAction={handleCreateJourney}
          translationProgress={
            translationData?.journeyAiTranslateCreateSubscription
              ? {
                  progress:
                    translationData.journeyAiTranslateCreateSubscription
                      .progress ?? 0,
                  message:
                    translationData.journeyAiTranslateCreateSubscription
                      .message ?? ''
                }
              : undefined
          }
          isTranslating={translationVariables != null}
        />
      )}
    </>
  )
}
