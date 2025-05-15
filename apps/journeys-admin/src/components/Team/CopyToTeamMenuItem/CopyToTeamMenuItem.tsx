import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import CopyToIcon from '@core/shared/ui/icons/CopyTo'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { useJourneyAiTranslateMutation } from '../../../libs/useJourneyAiTranslateMutation'
import { MenuItem } from '../../MenuItem'

interface CopyToTeamMenuItemProps {
  id?: string
  handleCloseMenu: () => void
  handleKeepMounted?: () => void
  journey?: Journey
}

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

export function CopyToTeamMenuItem({
  id,
  handleCloseMenu,
  handleKeepMounted,
  journey
}: CopyToTeamMenuItemProps): ReactElement {
  const router = useRouter()
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] =
    useState<boolean>(false)
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { translateJourney } = useJourneyAiTranslateMutation()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [loading, setLoading] = useState(false)

  const handleDuplicateJourney = async (
    teamId: string,
    selectedLanguage?: JourneyLanguage
  ): Promise<void> => {
    if (id == null) return

    try {
      setLoading(true)
      const { data: duplicateData } = await journeyDuplicate({
        variables: {
          id,
          teamId
        }
      })

      if (duplicateData?.journeyDuplicate?.id) {
        if (journey == null) return

        // If no language selected, just show copied message
        if (selectedLanguage == null) {
          enqueueSnackbar(t('Journey Copied'), {
            variant: 'success',
            preventDuplicate: true
          })
          return
        }

        const translatedJourney = await translateJourney({
          journeyId: duplicateData.journeyDuplicate.id,
          name: journey.title,
          journeyLanguageName:
            journey?.language.name.find(({ primary }) => !primary)?.value ?? '',
          textLanguageId: selectedLanguage.id,
          textLanguageName:
            selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
        })
        if (translatedJourney) {
          console.log('Translated')
          enqueueSnackbar(t('Journey Translated'), {
            variant: 'success',
            preventDuplicate: true
          })
        } else {
          throw new Error('Failed to translate journey')
        }
      } else {
        throw new Error('Journey duplication failed')
      }
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    } finally {
      setLoading(false)
      handleCloseMenu()
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

  return (
    <>
      <MenuItem
        label={t('Copy to ...')}
        icon={<CopyToIcon color="secondary" />}
        onClick={() => {
          handleKeepMounted?.()
          handleCloseMenu()
          setRoute('copy-journey')
          setDuplicateTeamDialogOpen(true)
        }}
        testId="Copy"
      />
      <CopyToTeamDialog
        title={t('Copy to Another Team')}
        submitLabel={t('Add')}
        open={duplicateTeamDialogOpen}
        loading={loading}
        onClose={() => {
          setDuplicateTeamDialogOpen(false)
        }}
        submitAction={handleDuplicateJourney}
      />
    </>
  )
}
