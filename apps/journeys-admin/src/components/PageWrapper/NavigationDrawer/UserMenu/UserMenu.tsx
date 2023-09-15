import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { AuthUser } from 'next-firebase-auth'
import { ReactElement } from 'react'

import Logout2Icon from '@core/shared/ui/icons/Logout2'

import { GetMe_me as User } from '../../../../../__generated__/GetMe'
import { MenuItem } from '../../../MenuItem'

export interface UserMenuProps {
  user: User
  profileOpen: boolean
  profileAnchorEl: HTMLElement | null
  handleProfileClose: () => void
  authUser: AuthUser
}

export function UserMenu({
  user,
  profileOpen,
  profileAnchorEl,
  handleProfileClose,
  authUser
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
        label="Logout"
        icon={<Logout2Icon fontSize="small" />}
        onClick={async () => {
          handleProfileClose()
          await authUser.signOut()
        }}
      />
    </Menu>
  )
}
