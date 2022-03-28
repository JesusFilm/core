import { ReactElement, ReactNode, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Link from 'next/link'
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import Image from 'next/image'
import { AuthUser } from 'next-firebase-auth'
import { gql, useQuery } from '@apollo/client'
import { compact } from 'lodash'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import taskbarIcon from '../../../public/taskbar-icon.svg'
import { GetMe } from '../../../__generated__/GetMe'

export interface PageWrapperProps {
  backHref?: string
  showDrawer?: boolean
  title: string
  Menu?: ReactNode
  children?: ReactNode
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

export function PageWrapper({
  backHref,
  showDrawer,
  title,
  Menu: CustomMenu,
  children,
  AuthUser
}: PageWrapperProps): ReactElement {
  const [profileAnchorEl, setProfileAnchorEl] = useState(null)
  const profileOpen = Boolean(profileAnchorEl)
  const [open, setOpen] = useState<boolean>(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const handleProfileClick = (event): void => {
    setProfileAnchorEl(event.currentTarget)
  }
  const handleProfileClose = (): void => {
    setProfileAnchorEl(null)
  }
  const { data } = useQuery<GetMe>(GET_ME)

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        sx={{
          ml: { sm: '72px' },
          mr: { sm: showDrawer === true ? '328px' : 0 },
          width: {
            sm:
              showDrawer === true
                ? 'calc(100% - 72px - 328px)'
                : 'calc(100% - 72px)'
          }
        }}
      >
        {!smUp ? (
          <Toolbar
            sx={{
              position: 'relative',
              backgroundColor: 'secondary.dark'
            }}
          >
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(!open)}
            >
              <MenuIcon sx={{ color: 'background.paper' }} />
            </IconButton>
            <Box
              sx={{
                position: 'absolute',
                right: '45%'
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
          </Toolbar>
        ) : (
          <></>
        )}
        <Toolbar>
          {backHref != null && (
            <Link href={backHref} passHref>
              <IconButton
                edge="start"
                size="small"
                color="inherit"
                sx={{ mr: 2 }}
              >
                <ChevronLeftRounded />
              </IconButton>
            </Link>
          )}
          <Typography
            variant="subtitle1"
            component="div"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {title}
          </Typography>
          {CustomMenu != null && CustomMenu}
        </Toolbar>
      </AppBar>
      <Toolbar
        sx={{
          ml: { sm: '72px' },
          mr: { sm: showDrawer === true ? '328px' : 0 }
        }}
      />
      <Drawer
        open={open}
        sx={{
          width: '237px',
          flexShrink: 0,
          display: { xs: smUp ? 'none' : 'flex', sm: 'flex' },
          '& .MuiDrawer-paper': {
            width: open ? '237px' : '72px',
            boxSizing: 'border-box',
            backgroundColor: '#25262E',
            border: 0
          }
        }}
        elevation={0}
        hideBackdrop
        variant={smUp ? 'permanent' : 'temporary'}
        anchor="left"
      >
        <List>
          <ListItem
            sx={{
              justifyContent: open ? 'flex-start' : 'center',
              my: 1
            }}
          >
            <IconButton
              size="large"
              color="inherit"
              aria-label="chevron"
              onClick={() => setOpen(!open)}
              sx={{
                color: 'secondary.dark',
                backgroundColor: 'secondary.light',
                '&:hover': {
                  backgroundColor: 'secondary.light'
                },
                width: 24,
                height: 24,
                borderRadius: 2
              }}
            >
              {open ? <ChevronLeftRounded /> : <ChevronRightRounded />}
            </IconButton>
          </ListItem>
          <Link href="/" passHref>
            <ListItem
              sx={{
                justifyContent: open ? 'flex-start' : 'center',
                color: '#6D6F81',
                fontSize: 28,
                my: 1
              }}
              button
            >
              <ExploreRoundedIcon fontSize="inherit" />
              {open ? (
                <Typography variant="h5" sx={{ ml: 4 }}>
                  Discover
                </Typography>
              ) : undefined}
            </ListItem>
          </Link>
        </List>
        {AuthUser != null && data?.me != null && (
          <>
            <Divider sx={{ borderColor: '#383940' }} />
            <List
              sx={{
                flexGrow: 1
              }}
            >
              <ListItem
                sx={{
                  flexGrow: 1,
                  justifyContent: open ? 'flex-start' : 'center',
                  color: '#6D6F81',
                  my: 1
                }}
                button
                onClick={handleProfileClick}
              >
                <Avatar
                  alt={compact([data.me.firstName, data.me.lastName]).join(' ')}
                  src={data.me.imageUrl ?? undefined}
                  sx={{ width: 24, height: 24 }}
                />
                {open ? (
                  <Typography variant="h5" sx={{ ml: 5 }}>
                    Profile
                  </Typography>
                ) : undefined}
              </ListItem>
            </List>
            <Toolbar
              sx={{
                border: 'transparent',
                justifyContent: open ? 'flex-start' : 'center',
                ml: open ? 2 : 0,
                mb: 8
              }}
            >
              <Image
                src={taskbarIcon}
                width={32}
                height={32}
                layout="fixed"
                alt="Next Steps"
              />
              {open ? (
                <Typography
                  variant="h5"
                  sx={{ color: 'background.paper', ml: 4 }}
                >
                  NextSteps
                </Typography>
              ) : undefined}
            </Toolbar>
            <Menu
              anchorEl={profileAnchorEl}
              open={profileOpen}
              onClose={handleProfileClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ py: 2, px: 4 }}
                alignItems="center"
              >
                <Box>
                  <Avatar
                    alt={compact([data.me.firstName, data.me.lastName]).join(
                      ' '
                    )}
                    src={data.me.imageUrl ?? undefined}
                  />
                </Box>
                <Box>
                  <Typography>
                    {compact([data.me.firstName, data.me.lastName]).join(' ')}
                  </Typography>
                  {data.me.email != null && (
                    <Typography variant="body2" color="textSecondary">
                      {data.me.email}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Divider />
              <MenuItem
                onClick={async () => {
                  handleProfileClose()
                  await AuthUser.signOut()
                }}
              >
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Drawer>
      <Box sx={{ ml: { sm: '72px' }, mt: smUp ? 0 : '48px' }}>{children}</Box>
    </>
  )
}
