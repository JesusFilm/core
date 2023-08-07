import { ReactElement } from 'react'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import { useSnackbar } from 'notistack'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { MenuItem } from '../../../../MenuItem'
import { useJourneyDuplicateMutation } from '../../../../../libs/useJourneyDuplicateMutation'
// TODO: remove when teams is released
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

  // TODO: remove when teams is released
  const { teams } = useFlags()

  const handleDuplicateJourney = async (): Promise<void> => {
    // TODO: add activeteam.id not null check when teams is released
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
      disabled={activeTeam?.id == null && teams}
      label="Duplicate"
      icon={<ContentCopyRounded color="secondary" />}
      onClick={handleDuplicateJourney}
    />
  )
}
