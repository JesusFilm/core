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

import { MenuItem } from '../../../../MenuItem'

interface DuplicateJourneyMenuItemProps {
  id?: string
  handleCloseMenu: () => void
}

export function DuplicateJourneyMenuItem({
  id,
  handleCloseMenu
}: DuplicateJourneyMenuItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { activeTeam } = useTeam()
  const { enqueueSnackbar } = useSnackbar()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [journeyDuplicate] = useJourneyDuplicateMutation()

  async function handleDuplicateJourney(teamId?: string): Promise<void> {
    if (id == null) return
    setLoading(true)
    try {
      if (teamId != null) {
        await journeyDuplicate({
          variables: {
            id,
            teamId
          }
        })
      } else if (activeTeam?.id != null) {
        await journeyDuplicate({
          variables: { id, teamId: activeTeam.id }
        })
      }
      enqueueSnackbar(
        activeTeam?.id != null ? t('Journey Duplicated') : t('Journey Copied'),
        {
          variant: 'success',
          preventDuplicate: true
        }
      )
      handleCloseMenu()
    } catch (error) {
      enqueueSnackbar(t('Failed to duplicate journey'), {
        variant: 'error',
        preventDuplicate: true
      })
    } finally {
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
        onClose={() => {
          setOpen(false)
        }}
        submitAction={handleDuplicateJourney}
      />
    </>
  )
}
