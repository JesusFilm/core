import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

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
  const [journeyDuplicate] = useJourneyDuplicateMutation()
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
      icon={<ContentCopyRounded color="secondary" />}
      onClick={handleDuplicateJourney}
    />
  )
}
