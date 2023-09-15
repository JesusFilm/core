import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import More from '@core/shared/ui/icons/More'
import Plus1Icon from '@core/shared/ui/icons/Plus1'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { MenuItem } from '../../MenuItem'
import { TeamAvatars } from '../TeamAvatars'
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

      {activeTeam != null && (
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <TeamAvatars
            onClick={() => setTeamManageOpen(true)}
            userTeams={activeTeam.userTeams}
            size="large"
          />
        </Box>
      )}
      <IconButton edge="end" color="inherit" onClick={handleShowMenu}>
        <More />
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
          icon={<UsersProfiles2Icon />}
          onClick={() => {
            setTeamManageOpen(true)
            setAnchorEl(null)
          }}
        />
        <MenuItem
          disabled={activeTeam == null}
          key="rename-team"
          label={t('Rename')}
          icon={<Edit2Icon />}
          onClick={() => {
            setTeamUpdateOpen(true)
            setAnchorEl(null)
          }}
        />
        <MenuItem
          key="create-new-team"
          label={t('New Team')}
          icon={<Plus1Icon />}
          onClick={() => {
            setTeamCreateOpen(true)
            setAnchorEl(null)
          }}
        />
      </Menu>
    </>
  )
}
