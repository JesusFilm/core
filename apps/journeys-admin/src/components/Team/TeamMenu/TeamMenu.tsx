import MoreVert from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Edit2 from '@core/shared/ui/icons/Edit2'
import Plus1 from '@core/shared/ui/icons/Plus1'
import UsersProfiles2 from '@core/shared/ui/icons/UsersProfiles2'

import { MenuItem } from '../../MenuItem'
import { TeamCreateDialog } from '../TeamCreateDialog'
import { TeamManageDialog } from '../TeamManageDialog'
import { useTeam } from '../TeamProvider'
import { TeamUpdateDialog } from '../TeamUpdateDialog'

export function TeamMenu(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const [teamCreateOpen, setTeamCreateOpen] = useState(false)
  const [teamUpdateOpen, setTeamUpdateOpen] = useState(false)
  const [teamManageOpen, setTeamManageOpen] = useState(false)
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
        onCreate={() => {
          setTeamManageOpen(true)
        }}
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
      <TeamManageDialog
        open={teamManageOpen}
        onClose={() => {
          setTeamManageOpen(false)
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
          disabled={activeTeam == null}
          key="manage-team"
          label={t('Members')}
          icon={<UsersProfiles2 />}
          onClick={() => {
            setTeamManageOpen(true)
            setAnchorEl(null)
          }}
        />
        <MenuItem
          disabled={activeTeam == null}
          key="rename-team"
          label={t('Rename')}
          icon={<Edit2 />}
          onClick={() => {
            setTeamUpdateOpen(true)
            setAnchorEl(null)
          }}
        />
        <MenuItem
          key="create-new-team"
          label={t('New Team')}
          icon={<Plus1 />}
          onClick={() => {
            setTeamCreateOpen(true)
            setAnchorEl(null)
          }}
        />
      </Menu>
    </>
  )
}
