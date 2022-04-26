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

  return (
    <Tooltip title={displayName}>
      <Avatar alt={displayName} src={user.imageUrl ?? undefined}>
        {displayName.charAt(0)?.toUpperCase()}
      </Avatar>
    </Tooltip>
  )
}

interface UserJourney {
  user: User | null
}

export interface AccessAvatarsProps {
  journeySlug?: string
  userJourneys?: UserJourney[]
  size?: 'small' | 'medium' | 'large'
  xsMax?: number
  smMax?: number
}

export function AccessAvatars({
  journeySlug,
  userJourneys,
  size = 'small',
  xsMax = 3,
  smMax = 5
}: AccessAvatarsProps): ReactElement {
  const [open, setOpen] = useState(false)
  const children = userJourneys?.map(
    ({ user }) => user != null && <AccessAvatar user={user} key={user.id} />
  )
  // small default sizes
  let diameter: number
  let fontSize: number | undefined
  let borderWidth: number | undefined

  switch (size) {
    case 'small':
      diameter = 31
      fontSize = 12
      borderWidth = 1
      break
    case 'medium':
      diameter = 48
      break
    case 'large':
      diameter = 52
      break
  }

  return (
    <>
      {journeySlug != null ? (
        <>
          <Box
            onClick={() => setOpen(true)}
            sx={{
              cursor: 'pointer',
              height: diameter
            }}
            role="button"
          >
            <AvatarGroup
              max={xsMax}
              sx={{
                display: { xs: 'inline-flex', sm: 'none' },
                '> .MuiAvatar-root': {
                  width: diameter,
                  height: diameter,
                  fontSize,
                  borderWidth,
                  borderColor: '#FFF'
                },
                '> .MuiAvatarGroup-avatar': {
                  backgroundColor: 'primary.main'
                }
              }}
            >
              {children}
            </AvatarGroup>
            <AvatarGroup
              max={smMax}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                '> .MuiAvatar-root': {
                  width: diameter,
                  height: diameter,
                  fontSize,
                  borderWidth,
                  borderColor: '#FFF'
                },
                '> .MuiAvatarGroup-avatar': {
                  backgroundColor: 'primary.main'
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
      ) : (
        <Box>
          <AvatarGroup
            sx={{
              display: 'inline-flex',
              '> .MuiAvatar-root': {
                width: diameter,
                height: diameter,
                fontSize,
                borderWidth,
                borderColor: '#FFF'
              }
            }}
          >
            <Avatar />
            <Avatar />
            <Avatar />
          </AvatarGroup>
        </Box>
      )}
    </>
  )
}
