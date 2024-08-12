import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import CopyToIcon from '@core/shared/ui/icons/CopyTo'

import { MenuItem } from '../../MenuItem'

interface DuplicateJourneyMenuItemProps {
  id?: string
  handleCloseMenu: () => void
}

export function CopyToTeamMenuItem({
  id,
  handleCloseMenu
}: DuplicateJourneyMenuItemProps): ReactElement {
  const router = useRouter()
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] =
    useState<boolean>(false)
  const [journeyDuplicate] = useJourneyDuplicateMutation()

  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')

  const handleDuplicateJourney = async (teamId: string): Promise<void> => {
    if (id == null) return

    const data = await await journeyDuplicate({
      variables: {
        id,
        teamId
      }
    })

    if (data != null) {
      handleCloseMenu()
      enqueueSnackbar(t('Journey Copied'), {
        variant: 'success',
        preventDuplicate: true
      })
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
          setRoute('copy-journey')
          setDuplicateTeamDialogOpen(true)
        }}
        testId="Copy"
      />
      <CopyToTeamDialog
        title={t('Copy to Another Team')}
        open={duplicateTeamDialogOpen}
        onClose={() => {
          setDuplicateTeamDialogOpen(false)
        }}
        submitAction={handleDuplicateJourney}
      />
    </>
  )
}
