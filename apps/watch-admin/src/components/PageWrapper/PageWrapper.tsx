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
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import Image from 'next/image'
import { AuthUser } from 'next-firebase-auth'
import { gql, useQuery } from '@apollo/client'
import { compact } from 'lodash'
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
        sx={{
          width: '72px',
          flexShrink: 0,
          display: { xs: 'none', sm: 'flex' },
          '& .MuiDrawer-paper': {
            width: '72px',
            boxSizing: 'border-box',
            backgroundColor: '#25262E',
            border: 0
          }
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ border: 'transparent', justifyContent: 'center', p: 0 }}>
          <Image
            src={taskbarIcon}
            width={32}
            height={32}
            layout="fixed"
            alt="Next Steps"
          />
        </Toolbar>
        <List>
          <Link href="/" passHref>
            <ListItem
              sx={{ justifyContent: 'center', color: '#6D6F81', fontSize: 28 }}
              button
            >
              <ExploreRoundedIcon fontSize="inherit" />
            </ListItem>
          </Link>
        </List>
        {AuthUser != null && data?.me != null && (
          <>
            <Divider sx={{ borderColor: '#383940' }} />
            <List>
              <ListItem
                sx={{ justifyContent: 'center', color: '#6D6F81' }}
                button
                onClick={handleProfileClick}
              >
                <Avatar
                  alt={compact([data.me.firstName, data.me.lastName]).join(' ')}
                  src={data.me.imageUrl ?? undefined}
                  sx={{ width: 24, height: 24 }}
                />
              </ListItem>
            </List>
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
      <Box sx={{ ml: { sm: '72px' } }}>{children}</Box>
    </>
  )
}
