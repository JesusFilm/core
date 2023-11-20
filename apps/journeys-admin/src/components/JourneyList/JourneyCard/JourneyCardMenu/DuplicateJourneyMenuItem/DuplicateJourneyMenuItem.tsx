import CircularProgress from '@mui/material/CircularProgress'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import { useJourneyDuplicateMutation } from '../../../../../libs/useJourneyDuplicateMutation'
import { MenuItem } from '../../../../MenuItem'
import { useTeam } from '../../../../Team/TeamProvider'

interface DuplicateJourneyMenuItemProps {
  id?: string
  handleCloseMenu: () => void
}

export function DuplicateJourneyMenuItem({
  id,
  handleCloseMenu
}: DuplicateJourneyMenuItemProps): ReactElement {
  const [journeyDuplicate, { loading }] = useJourneyDuplicateMutation()
  const { enqueueSnackbar } = useSnackbar()
  const { activeTeam } = useTeam()

  const handleDuplicateJourney = async (): Promise<void> => {
    if (id == null || activeTeam?.id == null) return

    const data = await journeyDuplicate({
      variables: { id, teamId: activeTeam.id }
    })
    if (data != null) {
      handleCloseMenu()
      enqueueSnackbar(`Journey Duplicated`, {
        variant: 'success',
        preventDuplicate: true
      })
    }
  }

  return (
    <MenuItem
      disabled={activeTeam?.id == null}
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
      onClick={handleDuplicateJourney}
      testId="Duplicate"
    />
  )
}
