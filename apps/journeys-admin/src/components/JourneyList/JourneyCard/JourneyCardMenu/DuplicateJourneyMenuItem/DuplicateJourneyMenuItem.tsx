import { FetchResult } from '@apollo/client'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import { JourneyDuplicate } from '../../../../../../__generated__/JourneyDuplicate'
import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
import { useJourneyDuplicateMutation } from '../../../../../libs/useJourneyDuplicateMutation'
import { MenuItem } from '../../../../MenuItem'
import { CopyToTeamDialog } from '../../../../Team/CopyToTeamDialog'
import { useTeam } from '../../../../Team/TeamProvider'

interface DuplicateJourneyMenuItemProps {
  id?: string
  handleCloseMenu: () => void
}

export function DuplicateJourneyMenuItem({
  id,
  handleCloseMenu
}: DuplicateJourneyMenuItemProps): ReactElement {
  const router = useRouter()
  const [journeyDuplicate, { loading }] = useJourneyDuplicateMutation()
  const { t } = useTranslation('apps-journeys-admin')
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] =
    useState<boolean>(false)
  const { enqueueSnackbar } = useSnackbar()
  const { activeTeam } = useTeam()

  const handleDuplicateJourney = async (teamId?: string): Promise<void> => {
    if (id == null) return
    let data: FetchResult<JourneyDuplicate> | undefined
    if (teamId != null) {
      data = await journeyDuplicate({
        variables: {
          id,
          teamId
        }
      })
    }
    if (activeTeam?.id != null) {
      data = await journeyDuplicate({
        variables: { id, teamId: activeTeam.id }
      })
    }
    if (data != null) {
      handleCloseMenu()
      enqueueSnackbar(
        activeTeam?.id != null ? t('Journey Duplicated') : t('Journey Copied'),
        {
          variant: 'success',
          preventDuplicate: true
        }
      )
    }
  }

  function setRoute(param: string): void {
    router.query.param = param
    void router.push(router)
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  return (
    <>
      <MenuItem
        label="Duplicate"
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
                setDuplicateTeamDialogOpen(true)
              }
        }
        testId="Duplicate"
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
