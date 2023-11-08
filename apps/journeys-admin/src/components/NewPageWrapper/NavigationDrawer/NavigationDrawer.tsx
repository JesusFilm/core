import { gql, useQuery } from '@apollo/client'
import Avatar from '@mui/material/Avatar'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import { Theme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import compact from 'lodash/compact'
import Image from 'next/image'
import { NextRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { MouseEvent, ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFlags } from '@core/shared/ui/FlagsProvider'
import Bag5Icon from '@core/shared/ui/icons/Bag5'
import BarGroup3Icon from '@core/shared/ui/icons/BarGroup3'
import BoxIcon from '@core/shared/ui/icons/Box'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import UserProfile3Icon from '@core/shared/ui/icons/UserProfile3'

import { GetMe } from '../../../../__generated__/GetMe'
import { JourneyStatus, Role } from '../../../../__generated__/globalTypes'
import nextstepsTitle from '../../../../public/nextsteps-title.svg'
import taskbarIcon from '../../../../public/taskbar-icon.svg'
import { useAdminJourneysQuery } from '../../../libs/useAdminJourneysQuery'
import { useUserRoleQuery } from '../../../libs/useUserRoleQuery'
import { getJourneyTooltip } from '../utils/getJourneyTooltip'

import { ImpersonateDialog } from './ImpersonateDialog'
import { NavigationListItem } from './NavigationListItem'
import { UserMenu } from './UserMenu'

const DRAWER_WIDTH = '237px'

export interface NavigationDrawerProps {
  open: boolean
  onClose: (value: boolean) => void
  user?: User
  router?: NextRouter
}

export const GET_ME = gql`
  query GetMe {
    me {
      id
      firstName
      lastName
      email
      imageUrl
      superAdmin
    }
  }
`

const StyledNavigationDrawer = styled(Drawer)(({ theme, open }) => ({
  width: '72px',
  display: 'flex',
  '& .MuiDrawer-paper': {
    border: 0,
    backgroundColor: theme.palette.secondary.dark,
    overflowX: 'hidden',
    ...(open === true && {
      width: DRAWER_WIDTH,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    }),
    ...(open === false && {
      width: theme.spacing(18),
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    })
  }
}))

export const StyledList = styled(List)({
  display: 'flex',
  flexDirection: 'column',
  '& .MuiListItemButton-root, & .MuiListItem-root': {
    paddingLeft: 0,
    marginBottom: 6,
    '& .MuiListItemIcon-root': {
      minWidth: 'unset',
      width: '72px',
      justifyContent: 'center'
    },
    '& .MuiListItemText-primary': {
      fontSize: '15px',
      fontWeight: 'bold'
    }
  }
})

export function NavigationDrawer({
  open,
  onClose,
  user,
  router
}: NavigationDrawerProps): ReactElement {
  const { data: activeJourneys } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published]
  })
  const journeys = activeJourneys?.journeys
  const { t } = useTranslation('apps-journeys-admin')
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLDivElement | null>(
    null
  )
  const [impersonateOpen, setImpersonateOpen] = useState(false)

  const { globalReports } = useFlags()

  const selectedPage = router?.pathname?.split('/')[1]

  const profileOpen = Boolean(profileAnchorEl)

  function handleImpersonateClick(): void {
    setImpersonateOpen(true)
  }

  function handleImpersonateClose(): void {
    setImpersonateOpen(false)
  }

  function handleProfileClick(event: MouseEvent<HTMLDivElement>): void {
    setProfileAnchorEl(event.currentTarget)
  }

  function handleProfileClose(): void {
    setProfileAnchorEl(null)
  }

  function handleClose(): void {
    onClose(!open)
  }

  const { data } = useQuery<GetMe>(GET_ME)
  const { data: userRoleData } = useUserRoleQuery()

  const journeyTooltip = getJourneyTooltip(t, journeys, user?.id)

  return (
    <StyledNavigationDrawer
      open={open}
      onClose={handleClose}
      variant={mdUp ? 'permanent' : 'temporary'}
      anchor="left"
    >
      {open && mdUp && <Backdrop open={open} onClick={handleClose} />}
      <StyledList>
        <ListItemButton onClick={handleClose} data-testid="toggle-nav-drawer">
          <ListItemIcon
            sx={{
              '> .MuiSvgIcon-root': {
                color: 'secondary.dark',
                backgroundColor: 'secondary.light',
                borderRadius: 2
              }
            }}
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </ListItemIcon>
        </ListItemButton>

        <NavigationListItem
          icon={<JourneysIcon />}
          label="Discover"
          selected={selectedPage === 'journeys' || selectedPage === ''} // empty for when page is index. UPDATE when we add the actual index page
          link="/"
          tooltipText={journeyTooltip}
        />

        <NavigationListItem
          icon={<Bag5Icon />}
          label="Templates"
          selected={selectedPage === 'templates'}
          link="/templates"
        />

        {globalReports && (
          <NavigationListItem
            icon={<BarGroup3Icon />}
            label="Analytics"
            selected={selectedPage === 'reports'}
            link="/reports"
          />
        )}

        {user?.id != null && data?.me != null && (
          <>
            <Divider sx={{ mb: 2, mx: 6, borderColor: 'secondary.main' }} />

            {userRoleData?.getUserRole?.roles?.includes(Role.publisher) ===
              true && (
              <NavigationListItem
                icon={<BoxIcon />}
                label="Publisher"
                selected={selectedPage === 'publisher'}
                link="/publisher"
              />
            )}
            {data.me.superAdmin === true && (
              <NavigationListItem
                icon={<UserProfile3Icon />}
                label="Impersonate"
                selected={false}
                handleClick={handleImpersonateClick}
              />
            )}
            {data.me.superAdmin === true && (
              <ImpersonateDialog
                open={impersonateOpen}
                onClose={handleImpersonateClose}
              />
            )}
            <NavigationListItem
              icon={
                <Avatar
                  alt={compact([data.me.firstName, data.me.lastName]).join(' ')}
                  src={data.me.imageUrl ?? undefined}
                  sx={{ width: 24, height: 24 }}
                />
              }
              label="Profile"
              selected={false}
              handleClick={handleProfileClick}
            />
            <UserMenu
              apiUser={data.me}
              profileOpen={profileOpen}
              profileAnchorEl={profileAnchorEl}
              handleProfileClose={handleProfileClose}
              user={user}
            />
          </>
        )}
      </StyledList>
      <Box sx={{ flexGrow: 1 }} />
      <StyledList>
        <ListItem>
          <ListItemIcon>
            <Image
              src={taskbarIcon}
              width={32}
              height={32}
              alt="Next Steps Logo"
            />
          </ListItemIcon>
          <Box sx={{ display: 'flex' }}>
            <Image
              src={nextstepsTitle}
              width={106}
              height={24}
              alt="Next Steps Title"
            />
          </Box>
        </ListItem>
      </StyledList>
    </StyledNavigationDrawer>
  )
}
