import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import { GetAdminJourneys_journeys as Journey } from '../../../../../../__generated__/GetAdminJourneys'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { MenuItem } from '../../../../MenuItem'

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

interface TranslationVariables {
  journeyId: string
  name: string
  journeyLanguageName: string
  textLanguageId: string
  textLanguageName: string
  userLanguageId?: string
  userLanguageName?: string
}

interface DuplicateJourneyMenuItemProps {
  id?: string
  handleCloseMenu: () => void
  journey?: Journey
  fromTemplateId?: string | null
}

export function DuplicateJourneyMenuItem({
  id,
  handleCloseMenu,
  journey,
  fromTemplateId
}: DuplicateJourneyMenuItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { activeTeam } = useTeam()
  const { journey: journeyFromContext } = useJourney()
  const journeyData = journey ?? journeyFromContext
  const { enqueueSnackbar } = useSnackbar()
  const { refetchTemplateStats } = useTemplateFamilyStatsAggregateLazyQuery()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [translationVariables, setTranslationVariables] = useState<
    TranslationVariables | undefined
  >(undefined)

  const [journeyDuplicate] = useJourneyDuplicateMutation()

  const { data: translationData } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    skip: translationVariables == null,
    onError(error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined)
    },
    onComplete() {
      if (fromTemplateId != null) {
        void refetchTemplateStats([fromTemplateId])
      }
      enqueueSnackbar(
        activeTeam?.id != null ? t('Journey Duplicated') : t('Journey Copied'),
        {
          variant: 'success',
          preventDuplicate: true
        }
      )
      setTranslationVariables(undefined)
      setLoading(false)
      setOpen(false)
      handleCloseMenu()
    }
  })

  async function handleDuplicateJourney(
    teamId?: string,
    language?: JourneyLanguage,
    showTranslation?: boolean
  ): Promise<void> {
    if (id == null) return
    setLoading(true)
    try {
      const targetTeamId = teamId ?? activeTeam?.id
      if (targetTeamId == null) {
        setLoading(false)
        return
      }

      const { data: duplicateData } = await journeyDuplicate({
        variables: { id, teamId: targetTeamId }
      })

      const duplicatedJourneyId = duplicateData?.journeyDuplicate?.id

      if (
        showTranslation === true &&
        language?.id != null &&
        duplicatedJourneyId != null &&
        journeyData?.language != null
      ) {
        const sourceLanguageName =
          journeyData.language.name.find(({ primary }) => !primary)?.value ?? ''

        setTranslationVariables({
          journeyId: duplicatedJourneyId,
          name: journeyData.title ?? '',
          journeyLanguageName: sourceLanguageName,
          textLanguageId: language.id,
          textLanguageName: language.nativeName ?? language.localName ?? '',
          userLanguageId: journeyData.language.id,
          userLanguageName: sourceLanguageName
        })
        // Subscription's onComplete / onError handles snackbar, refetch, close,
        // and clearing the loading state. Keep `loading` true until then.
        return
      }

      if (fromTemplateId != null) {
        void refetchTemplateStats([fromTemplateId])
      }

      enqueueSnackbar(
        activeTeam?.id != null ? t('Journey Duplicated') : t('Journey Copied'),
        {
          variant: 'success',
          preventDuplicate: true
        }
      )
      handleCloseMenu()
      setLoading(false)
    } catch (error) {
      enqueueSnackbar(t('Failed to duplicate journey'), {
        variant: 'error',
        preventDuplicate: true
      })
      setLoading(false)
    }
  }

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  const translationProgress =
    translationData?.journeyAiTranslateCreateSubscription
      ? {
          progress:
            translationData.journeyAiTranslateCreateSubscription.progress ?? 0,
          message:
            translationData.journeyAiTranslateCreateSubscription.message ?? ''
        }
      : undefined

  return (
    <>
      <MenuItem
        label={t('Duplicate')}
        disabled={loading}
        icon={
          loading ? (
            <CircularProgress
              size={24}
              color="inherit"
              data-testid="journey-duplicate-loader"
            />
          ) : (
            <CopyLeftIcon color="secondary" />
          )
        }
        onClick={
          activeTeam != null
            ? async () => await handleDuplicateJourney()
            : () => {
                setRoute('duplicate-journey')
                setOpen(true)
              }
        }
        data-testid="Duplicate"
      />
      <CopyToTeamDialog
        title={t('Copy to Another Team')}
        open={open}
        loading={loading}
        onClose={() => {
          setOpen(false)
        }}
        submitAction={handleDuplicateJourney}
        isTranslating={translationVariables != null}
        translationProgress={translationProgress}
        journeyIsTemplate={journey?.template ?? false}
        journeyFromTemplateId={journey?.fromTemplateId}
      />
    </>
  )
}
