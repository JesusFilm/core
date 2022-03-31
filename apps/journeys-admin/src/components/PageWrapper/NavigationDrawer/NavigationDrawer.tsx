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

const drawerWidth = '237px'

interface NavigationDrawerProps {
  open: boolean
  onClose: (value: boolean) => void
  AuthUser?: AuthUser
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
  width: drawerWidth,
  display: 'flex',
  boxSizing: 'border-box',
  border: 0,
  '& .MuiDrawer-paper': {
    backgroundColor: '#25262E',
    ...(open === true && {
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      }),
      overflowX: 'hidden'
    }),
    ...(open === false && {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      overflowX: 'hidden',
      width: `calc(${theme.spacing(18)})`,
      [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(18)})`
      }
    })
  }
}))

export function NavigationDrawer({
  open,
  onClose,
  AuthUser
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
      <List>
        <ListItemButton
          onClick={() => onClose(!open)}
          sx={{
            justifyContent: open ? 'initial' : 'center',
            px: 8,
            mt: 1,
            mb: 5.5
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              color: 'secondary.dark',
              mr: 'auto',
              backgroundColor: 'secondary.light',
              '&:hover': {
                backgroundColor: 'secondary.light'
              },
              borderRadius: 2
            }}
          >
            {open ? <ChevronLeftRounded /> : <ChevronRightRounded />}
          </ListItemIcon>
        </ListItemButton>
        <Link href="/" passHref>
          <ListItemButton
            sx={{
              justifyContent: open ? 'initial' : 'center',
              color: '#6D6F81',
              fontSize: 28,
              px: 7.3,
              my: 5.5
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 4.3 : 'auto',
                justifyContent: 'center'
              }}
            >
              <ExploreRoundedIcon
                fontSize="inherit"
                sx={{
                  color: 'secondary.light'
                }}
              />
            </ListItemIcon>
            {open ? <Typography variant="h5">Discover</Typography> : undefined}
          </ListItemButton>
        </Link>
      </List>
      {AuthUser != null && data?.me != null && (
        <>
          <Divider variant="middle" sx={{ borderColor: '#444451' }} />
          <List
            sx={{
              flexGrow: 1
            }}
          >
            <ListItemButton
              sx={{
                flexGrow: 1,
                justifyContent: open ? 'initial' : 'center',
                px: 8,
                color: '#6D6F81',
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
                  mr: open ? 5 : 'auto'
                }}
              />
              {open ? <Typography variant="h5">Profile</Typography> : undefined}
            </ListItemButton>
          </List>
          <Toolbar
            sx={{
              border: 'transparent',
              justifyContent: open ? 'initial' : 'center',
              mx: smUp ? 5 : 2,
              mb: 8
            }}
          >
            <Box
              sx={{
                mr: open ? 5 : 'auto'
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
            {open ? (
              <Typography variant="h5" sx={{ color: 'background.paper' }}>
                NextSteps
              </Typography>
            ) : undefined}
          </Toolbar>
          <UserMenu
            user={data.me}
            profileOpen={profileOpen}
            profileAnchorEl={profileAnchorEl}
            handleProfileClose={handleProfileClose}
            AuthUser={AuthUser}
          />
        </>
      )}
    </StyledNavigationDrawer>
  )
}
