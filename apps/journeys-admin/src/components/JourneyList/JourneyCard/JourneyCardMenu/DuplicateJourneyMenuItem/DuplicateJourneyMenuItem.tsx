import { FetchResult } from '@apollo/client'
import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import { JourneyDuplicate } from '../../../../../../__generated__/JourneyDuplicate'
import { MenuItem } from '../../../../MenuItem'

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
  const [open, setOpen] = useState<boolean>(false)
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
        label={t('Duplicate')}
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
        onClose={() => {
          setOpen(false)
        }}
        submitAction={handleDuplicateJourney}
      />
    </>
  )
}
