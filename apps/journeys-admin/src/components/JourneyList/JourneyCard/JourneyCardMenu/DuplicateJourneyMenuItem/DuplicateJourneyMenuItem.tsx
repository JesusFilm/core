import { ReactElement } from 'react'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import { useSnackbar } from 'notistack'
import { MenuItem } from '../../../../MenuItem'
import { useJourneyDuplicateMutation } from '../../../../../libs/useJourneyDuplicateMutation'
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
