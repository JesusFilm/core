import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import Typography from '@mui/material/Typography'
import Stack from '@mui/system/Stack'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import GlobeIcon from '@core/shared/ui/icons/Globe'
import MoreIcon from '@core/shared/ui/icons/More'
import PackagePlusIcon from '@core/shared/ui/icons/PackagePlus'
import Plus1Icon from '@core/shared/ui/icons/Plus1'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { MenuItem } from '../../MenuItem'
import { TeamAvatars } from '../TeamAvatars'

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

const DynamicCustomDomainDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "CustomDomainDialog" */
      '../CustomDomainDialog'
    ).then((mod) => mod.CustomDomainDialog),
  { ssr: false }
)

export function TeamMenu(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const { teamIntegrations } = useFlags()

  const [teamCreateOpen, setTeamCreateOpen] = useState<boolean | undefined>()
  const [teamUpdateOpen, setTeamUpdateOpen] = useState<boolean | undefined>()
  const [teamManageOpen, setTeamManageOpen] = useState<boolean | undefined>()
  const [customDomainOpen, setCustomDomainOpen] = useState<
    boolean | undefined
  >()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleShowMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = (): void => {
    setAnchorEl(null)
  }

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
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
      {customDomainOpen != null && (
        <DynamicCustomDomainDialog
          open={customDomainOpen}
          onClose={() => setCustomDomainOpen(false)}
        />
      )}

      {activeTeam != null && activeTeam?.customDomains[0]?.name != null && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          gap={1}
          sx={{
            mr: { xs: 0, sm: 4 },
            display: { xs: 'none', sm: 'flex' },
            width: { xs: 0, sm: 300, md: 250 }
          }}
        >
          <GlobeIcon sx={{ color: 'primary.main' }} />
          <Typography
            component="a"
            variant="subtitle3"
            sx={{
              whiteSpace: 'nowrap',
              color: 'primary.main',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {activeTeam.customDomains[0].name}
          </Typography>
        </Stack>
      )}
      {activeTeam != null && (
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <TeamAvatars
            onClick={() => {
              setRoute('teams')
              setTeamManageOpen(true)
            }}
            userTeams={activeTeam.userTeams}
            size="large"
          />
        </Box>
      )}

      <IconButton edge="end" color="inherit" onClick={handleShowMenu}>
        <MoreIcon data-testid="MoreIcon" />
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
            setRoute('teams')
            setTeamManageOpen(true)
            setAnchorEl(null)
          }}
        />
        <MenuItem
          disabled={activeTeam == null}
          key="custom-domain"
          label={t('Custom Domain')}
          icon={<GlobeIcon />}
          onClick={() => {
            setRoute('custom-domain')
            setCustomDomainOpen(true)
            setAnchorEl(null)
          }}
        />
        <MenuItem
          disabled={activeTeam == null}
          key="rename-team"
          label={t('Rename')}
          icon={<Edit2Icon />}
          onClick={() => {
            setRoute('rename-team')
            setTeamUpdateOpen(true)
            setAnchorEl(null)
          }}
        />
        <MenuItem
          key="create-new-team"
          label={t('New Team')}
          icon={<Plus1Icon />}
          onClick={() => {
            setRoute('create-team')
            setTeamCreateOpen(true)
            setAnchorEl(null)
          }}
        />
        {teamIntegrations && (
          <MenuItem
            key="integrations"
            label={t('Integrations')}
            icon={<PackagePlusIcon />}
            onClick={async () => {
              await router.push(`teams/${activeTeam?.id}/integrations`)
              setAnchorEl(null)
            }}
          />
        )}
      </Menu>
    </>
  )
}
