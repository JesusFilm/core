import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AuthUser } from 'next-firebase-auth'
import { compact } from 'lodash'
import { GetMe_me as User } from '../../../../../__generated__/GetMe'

export interface UserMenuProps {
  user: User
  profileOpen: boolean
  profileAnchorEl: HTMLElement | null
  handleProfileClose: () => void
  AuthUser: AuthUser
}

export function UserMenu({
  user,
  profileOpen,
  profileAnchorEl,
  handleProfileClose,
  AuthUser
}: UserMenuProps): ReactElement {
  return (
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
            alt={compact([user.firstName, user.lastName]).join(' ')}
            src={user.imageUrl ?? undefined}
          />
        </Box>
        <Box>
          <Typography>
            {compact([user.firstName, user.lastName]).join(' ')}
          </Typography>
          {user.email != null && (
            <Typography variant="body2" color="textSecondary">
              {user.email}
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
  )
}
