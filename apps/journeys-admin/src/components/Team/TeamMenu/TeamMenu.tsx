import { useTranslation } from 'react-i18next'
import { ReactElement, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MoreVert from '@mui/icons-material/MoreVert'
import { MenuItem } from '../../MenuItem'
import { TeamCreateDialog } from '../TeamCreateDialog'
import { TeamUpdateDialog } from '../TeamUpdateDialog'
import { useTeam } from '../TeamProvider'

export function TeamMenu(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const [teamCreateOpen, setTeamCreateOpen] = useState(false)
  const [teamUpdateOpen, setTeamUpdateOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <>
      <TeamCreateDialog
        open={teamCreateOpen}
        onClose={() => {
          setTeamCreateOpen(false)
        }}
      />
      <TeamUpdateDialog
        open={teamUpdateOpen}
        onClose={() => {
          setTeamUpdateOpen(false)
        }}
      />
      <IconButton edge="end" color="inherit" onClick={handleShowMenu}>
        <MoreVert />
      </IconButton>
      <Menu
        id="edit-journey-actions"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        MenuListProps={{
          'aria-labelledby': 'edit-journey-actions'
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuItem
          key="create-new-team"
          label={t('Create New Team')}
          icon={<AddIcon />}
          onClick={() => {
            setTeamCreateOpen(true)
            setAnchorEl(null)
          }}
        />
        <MenuItem
          disabled={activeTeam == null}
          key="rename-team"
          label={t('Rename Team')}
          icon={<EditIcon />}
          onClick={() => {
            setTeamUpdateOpen(true)
            setAnchorEl(null)
          }}
        />
      </Menu>
    </>
  )
}
