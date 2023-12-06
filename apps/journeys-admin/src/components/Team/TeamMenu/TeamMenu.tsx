import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Edit2Icon from '@core/shared/ui/icons/Edit2'
import MoreIcon from '@core/shared/ui/icons/More'
import Plus1Icon from '@core/shared/ui/icons/Plus1'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { MenuItem } from '../../MenuItem'
import { TeamAvatars } from '../TeamAvatars'
import { useTeam } from '../TeamProvider'

const DynamicTeamCreateDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TeamCreateDialog" */
      '../TeamCreateDialog'
    ).then((mod) => mod.TeamCreateDialog),
  { ssr: false }
)
const DynamicTeamUpdateDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TeamUpdateDialog" */
      '../TeamUpdateDialog'
    ).then((mod) => mod.TeamUpdateDialog),
  { ssr: false }
)
const DynamicTeamManageDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TeamManageDialog" */
      '../TeamManageDialog'
    ).then((mod) => mod.TeamManageDialog),
  { ssr: false }
)

export function TeamMenu(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const [teamCreateOpen, setTeamCreateOpen] = useState<boolean | undefined>()
  const [teamUpdateOpen, setTeamUpdateOpen] = useState<boolean | undefined>()
  const [teamManageOpen, setTeamManageOpen] = useState<boolean | undefined>()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  return (
    <>
      {teamCreateOpen != null && (
        <DynamicTeamCreateDialog
          open={teamCreateOpen}
          onCreate={() => setTeamManageOpen(true)}
          onClose={() => setTeamCreateOpen(false)}
        />
      )}
      {teamUpdateOpen != null && (
        <DynamicTeamUpdateDialog
          open={teamUpdateOpen}
          onClose={() => setTeamUpdateOpen(false)}
        />
      )}
      {teamManageOpen != null && (
        <DynamicTeamManageDialog
          open={teamManageOpen}
          onClose={() => setTeamManageOpen(false)}
        />
      )}

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
        <MoreIcon />
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
        data-testid="TeamMenu"
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
