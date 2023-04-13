import { ReactElement } from 'react'
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded'
import { useSnackbar } from 'notistack'
import { MenuItem } from '../../../../MenuItem'
import { useJourneyDuplicate } from '../../../../../libs/useJourneyDuplicate'

interface DuplicateJourneyMenuItemProps {
  id?: string
  handleCloseMenu: () => void
}

export function DuplicateJourneyMenuItem({
  id,
  handleCloseMenu
}: DuplicateJourneyMenuItemProps): ReactElement {
  const { duplicateJourney } = useJourneyDuplicate()
  const { enqueueSnackbar } = useSnackbar()

  const handleDuplicateJourney = async (): Promise<void> => {
    if (id == null) return

    const data = await duplicateJourney({ id })

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
      label="Duplicate"
      icon={<ContentCopyRounded color="secondary" />}
      onClick={handleDuplicateJourney}
    />
  )
}
