import { ReactElement, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { AuthUser } from 'next-firebase-auth'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Link from 'next/link'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import Image from 'next/image'
import { compact } from 'lodash'
import { gql, useQuery } from '@apollo/client'
import taskbarIcon from '../../../../public/taskbar-icon.svg'
import { GetMe } from '../../../../__generated__/GetMe'
import { UserMenu } from './UserMenu'

const DRAWER_WIDTH = '237px'

export interface NavigationDrawerProps {
  open: boolean
  onClose: (value: boolean) => void
  authUser?: AuthUser
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
      }),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(18)
      }
    })
  }
}))

export function NavigationDrawer({
  open,
  onClose,
  authUser
}: NavigationDrawerProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [profileAnchorEl, setProfileAnchorEl] = useState(null)

  const profileOpen = Boolean(profileAnchorEl)
  const handleProfileClick = (event): void => {
    setProfileAnchorEl(event.currentTarget)
  }
  const handleProfileClose = (): void => {
    setProfileAnchorEl(null)
  }

  const { data } = useQuery<GetMe>(GET_ME)

  return (
    <StyledNavigationDrawer
      open={open}
      elevation={0}
      hideBackdrop
      variant={smUp ? 'permanent' : 'temporary'}
      anchor="left"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: DRAWER_WIDTH,
          height: '100%'
        }}
      >
        <List>
          <ListItemButton
            onClick={() => onClose(!open)}
            sx={{
              px: 6,
              mt: 1,
              mb: 5.5
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                color: 'secondary.dark',
                backgroundColor: 'secondary.light',
                '&:hover': {
                  backgroundColor: 'secondary.light'
                },
                mr: 'auto',
                borderRadius: 2
              }}
            >
              {open ? <ChevronLeftRounded /> : <ChevronRightRounded />}
            </ListItemIcon>
          </ListItemButton>
          <Link href="/" passHref>
            <ListItemButton
              sx={{
                color: 'secondary.light',
                fontSize: 28,
                px: 5.4,
                my: 5.5
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  justifyContent: 'center',
                  mr: 6
                }}
              >
                <ExploreRoundedIcon
                  fontSize="inherit"
                  sx={{
                    color: 'secondary.light'
                  }}
                />
              </ListItemIcon>
              <Typography variant="h5">Discover</Typography>
            </ListItemButton>
          </Link>
        </List>
        {authUser != null && data?.me != null && (
          <>
            <Divider sx={{ borderColor: 'secondary.main' }} />
            <List
              sx={{
                flexGrow: 1
              }}
            >
              <ListItemButton
                sx={{
                  flexGrow: 1,
                  color: 'secondary.light',
                  px: 6,
                  my: 5.5
                }}
                onClick={handleProfileClick}
              >
                <Avatar
                  alt={compact([data.me.firstName, data.me.lastName]).join(' ')}
                  src={data.me.imageUrl ?? undefined}
                  sx={{
                    width: 24,
                    height: 24,
                    mr: 6.5
                  }}
                />
                <Typography variant="h5">Profile</Typography>
              </ListItemButton>
            </List>
            <Toolbar
              sx={{
                border: 'transparent',
                mx: smUp ? 2 : 2,
                mb: 8
              }}
            >
              <Box
                sx={{
                  mr: 5.5
                }}
              >
                <Image
                  src={taskbarIcon}
                  width={32}
                  height={32}
                  layout="fixed"
                  alt="Next Steps"
                />
              </Box>
              <Typography
                variant="h5"
                sx={{ color: 'secondary.contrastText' }}
              >
                NextSteps
              </Typography>
            </Toolbar>
            <UserMenu
              user={data.me}
              profileOpen={profileOpen}
              profileAnchorEl={profileAnchorEl}
              handleProfileClose={handleProfileClose}
              authUser={authUser}
            />
          </>
        )}
      </Box>
    </StyledNavigationDrawer>
  )
}
