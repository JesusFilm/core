import { ReactElement, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { compact } from 'lodash'
import { AccessDialog } from '../AccessDialog'

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

  console.log(user.imageUrl)

  return (
    <Tooltip title={displayName}>
      <Avatar alt={displayName} src={user.imageUrl ?? undefined}>
        {displayName.charAt(0)?.toUpperCase()}
      </Avatar>
    </Tooltip>
  )
}

export interface AccessAvatarsProps {
  journeySlug: string
  users: User[]
}

export function AccessAvatars({
  journeySlug,
  users
}: AccessAvatarsProps): ReactElement {
  const [open, setOpen] = useState(false)
  const children = users.map((user) => (
    <AccessAvatar user={user} key={user.id} />
  ))

  return (
    <>
      <Box
        onClick={() => setOpen(true)}
        sx={{ cursor: 'pointer' }}
        role="Button"
      >
        <AvatarGroup
          max={3}
          sx={{
            display: { xs: 'inline-flex', md: 'none' },
            '> .MuiAvatar-root': {
              width: 31,
              height: 31,
              fontSize: 12
            }
          }}
        >
          {children}
        </AvatarGroup>
        <AvatarGroup
          max={5}
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            '> .MuiAvatar-root': {
              width: 31,
              height: 31,
              fontSize: 12
            }
          }}
        >
          {children}
        </AvatarGroup>
      </Box>
      <AccessDialog
        journeySlug={journeySlug}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
