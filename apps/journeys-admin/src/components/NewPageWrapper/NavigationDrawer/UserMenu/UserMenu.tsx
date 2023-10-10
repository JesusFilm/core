import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'

import Logout2Icon from '@core/shared/ui/icons/Logout2'

import { GetMe_me as ApiUser } from '../../../../../__generated__/GetMe'
import { MenuItem } from '../../../MenuItem'

export interface UserMenuProps {
  apiUser: ApiUser
  profileOpen: boolean
  profileAnchorEl: HTMLElement | null
  handleProfileClose: () => void
  user: User
}

export function UserMenu({
  apiUser,
  profileOpen,
  profileAnchorEl,
  handleProfileClose,
  user
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
      data-testid="UserMenu"
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ py: 2, px: 4 }}
        alignItems="center"
      >
        <Box>
          <Avatar
            alt={compact([apiUser.firstName, apiUser.lastName]).join(' ')}
            src={apiUser.imageUrl ?? undefined}
          />
        </Box>
        <Box>
          <Typography>
            {compact([apiUser.firstName, apiUser.lastName]).join(' ')}
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
          await user.signOut()
        }}
      />
    </Menu>
  )
}
