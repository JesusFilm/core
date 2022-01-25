import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { compact } from 'lodash'

interface User {
  id: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
}

interface AccessAvatarProps {
  user: User
}

function AccessAvatar({ user }: AccessAvatarProps): ReactElement {
  const displayName = compact([user.firstName, user.lastName]).join(' ')

  return (
    <Tooltip title={displayName}>
      <Avatar alt={displayName} src={user.imageUrl ?? undefined} />
    </Tooltip>
  )
}

export interface AccessAvatarsProps {
  users: User[]
}

export function AccessAvatars({ users }: AccessAvatarsProps): ReactElement {
  const children = users.map((user) => (
    <AccessAvatar user={user} key={user.id} />
  ))

  return (
    <Box>
      <AvatarGroup
        max={3}
        sx={{
          display: { xs: 'inline-flex', md: 'none' },
          '&.MuiAvatar-root': { width: 31, height: 31 }
        }}
      >
        {children}
      </AvatarGroup>
      <AvatarGroup
        max={5}
        sx={{
          display: { xs: 'none', md: 'inline-flex' },
          '&.MuiAvatar-root': { width: 31, height: 31 }
        }}
      >
        {children}
      </AvatarGroup>
    </Box>
  )
}
