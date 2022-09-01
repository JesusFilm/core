import { ReactElement, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { AuthUser } from 'next-firebase-auth'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, Theme } from '@mui/material/styles'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Link from 'next/link'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import ShopRoundedIcon from '@mui/icons-material/ShopRounded'
import ShopTwoRoundedIcon from '@mui/icons-material/ShopTwoRounded'
import Backdrop from '@mui/material/Backdrop'
import Image from 'next/image'
import { compact } from 'lodash'
import { gql, useQuery } from '@apollo/client'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import ViewCarouselRoundedIcon from '@mui/icons-material/ViewCarouselRounded'
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded'
import { Role } from '../../../../__generated__/globalTypes'
import taskbarIcon from '../../../../public/taskbar-icon.svg'
import nextstepsTitle from '../../../../public/nextsteps-title.svg'
import { GetMe } from '../../../../__generated__/GetMe'
import { GetUserRole } from '../../../../__generated__/GetUserRole'
import { GET_USER_ROLE } from '../../../../pages/templates/admin'
import { UserMenu } from './UserMenu'

const DRAWER_WIDTH = '237px'

export interface NavigationDrawerProps {
  open: boolean
  onClose: (value: boolean) => void
  authUser?: AuthUser
  title: string
}

export const GET_ME = gql`
  query GetMe {
    me {
      id
      firstName
      lastName
      email
      imageUrl
    }
  }
`

const StyledNavigationDrawer = styled(Drawer)(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  display: 'flex',
  boxSizing: 'border-box',
  border: 0,
  '& .MuiDrawer-paper': {
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

const StyledList = styled(List)({
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
  authUser,
  title
}: NavigationDrawerProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [profileAnchorEl, setProfileAnchorEl] = useState(null)
  const journeysSelected =
    title === 'Active Journeys' ||
    title === 'Archived Journeys' ||
    title === 'Trashed Journeys' ||
    title === 'Journey Details' ||
    title === 'Journey Reports'

  const { reports, templates } = useFlags()

  const profileOpen = Boolean(profileAnchorEl)
  const handleProfileClick = (event): void => {
    setProfileAnchorEl(event.currentTarget)
  }

  const handleProfileClose = (): void => {
    setProfileAnchorEl(null)
  }

  const handleClose = (): void => {
    onClose(!open)
  }

  const { data } = useQuery<GetMe>(GET_ME)
  const { data: userRoleData } = useQuery<GetUserRole>(GET_USER_ROLE)

  return (
    <StyledNavigationDrawer
      open={open}
      onClose={handleClose}
      variant={smUp ? 'permanent' : 'temporary'}
      anchor="left"
    >
      {open && smUp && <Backdrop open={open} onClick={handleClose} />}
      <StyledList>
        <ListItemButton onClick={handleClose}>
          <ListItemIcon
            sx={{
              '> .MuiSvgIcon-root': {
                color: 'secondary.dark',
                backgroundColor: 'secondary.light',
                borderRadius: 2
              }
            }}
          >
            {open ? <ChevronLeftRounded /> : <ChevronRightRounded />}
          </ListItemIcon>
        </ListItemButton>
        <Link href="/" passHref>
          <ListItemButton>
            <ListItemIcon
              sx={{
                color: journeysSelected ? 'background.paper' : 'secondary.light'
              }}
            >
              <ViewCarouselRoundedIcon />
            </ListItemIcon>
            <ListItemText
              primary="Journeys"
              sx={{
                color: journeysSelected ? 'background.paper' : 'secondary.light'
              }}
            />
          </ListItemButton>
        </Link>

        {templates && (
          <Link href="/templates" passHref>
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color:
                    title === 'Journey Templates'
                      ? 'background.paper'
                      : 'secondary.light'
                }}
              >
                <ShopRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Templates"
                sx={{
                  color:
                    title === 'Journey Templates'
                      ? 'background.paper'
                      : 'secondary.light'
                }}
              />
            </ListItemButton>
          </Link>
        )}

        {reports && (
          <Link href="/reports" passHref>
            <ListItemButton>
              <ListItemIcon
                sx={{
                  color:
                    title === 'Reports' ? 'background.paper' : 'secondary.light'
                }}
              >
                <LeaderboardRoundedIcon />
              </ListItemIcon>
              <ListItemText
                primary="Reports"
                sx={{
                  color:
                    title === 'Reports' ? 'background.paper' : 'secondary.light'
                }}
              />
            </ListItemButton>
          </Link>
        )}
        {authUser != null && data?.me != null && (
          <>
            <Divider sx={{ m: 6, mt: 0, borderColor: 'secondary.main' }} />

            {userRoleData?.getUserRole?.roles?.includes(Role.publisher) ===
              true &&
              templates && (
                <Link href="/templates/admin" passHref>
                  <ListItemButton>
                    <ListItemIcon
                      sx={{
                        color:
                          title === 'Templates Admin'
                            ? 'background.paper'
                            : 'secondary.light'
                      }}
                    >
                      <ShopTwoRoundedIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Templates Admin"
                      sx={{
                        color:
                          title === 'Templates Admin'
                            ? 'background.paper'
                            : 'secondary.light'
                      }}
                    />
                  </ListItemButton>
                </Link>
              )}

            <ListItemButton onClick={handleProfileClick}>
              <ListItemIcon>
                <Avatar
                  alt={compact([data.me.firstName, data.me.lastName]).join(' ')}
                  src={data.me.imageUrl ?? undefined}
                  sx={{ width: 24, height: 24 }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Profile"
                sx={{ color: 'secondary.light' }}
              />
            </ListItemButton>
            <UserMenu
              user={data.me}
              profileOpen={profileOpen}
              profileAnchorEl={profileAnchorEl}
              handleProfileClose={handleProfileClose}
              authUser={authUser}
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
              layout="fixed"
              alt="Next Steps Logo"
            />
          </ListItemIcon>
          <Box sx={{ display: 'flex' }}>
            <Image
              src={nextstepsTitle}
              width={106}
              height={24}
              layout="fixed"
              alt="Next Steps Title"
            />
          </Box>
        </ListItem>
      </StyledList>
    </StyledNavigationDrawer>
  )
}
