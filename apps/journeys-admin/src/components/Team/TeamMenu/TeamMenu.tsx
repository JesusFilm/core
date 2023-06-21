import { useTranslation } from 'react-i18next'
import { ReactElement, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import { MenuItem } from '../../MenuItem'
import { TeamCreateDialog } from '../TeamCreateDialog'

export function TeamMenu(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [teamCreateOpen, setTeamCreateOpen] = useState(false)

  return (
    <>
      <TeamCreateDialog
        open={teamCreateOpen}
        onClose={() => {
          setTeamCreateOpen(false)
        }}
      />
      <MenuItem
        key="create-new-team"
        label={t('Create New Team')}
        icon={<AddIcon />}
        onClick={() => {
          setTeamCreateOpen(true)
        }}
      />
      <MenuItem
        key="rename-team"
        label={t('Rename Team')}
        icon={<EditIcon />}
        onClick={() => {
          setTeamCreateOpen(true)
        }}
      />
    </>
  )
}
