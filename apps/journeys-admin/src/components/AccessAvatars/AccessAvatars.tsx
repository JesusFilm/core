import { ReactElement, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup, { AvatarGroupProps } from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { compact } from 'lodash'
import { AccessDialog } from '../AccessDialog'
import { ManageAccessAvatar } from './ManageAccessAvatar/ManageAccessAvatar'

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
      <Avatar
        alt={displayName}
        src={user.imageUrl ?? undefined}
        aria-label="avatar"
      >
        {displayName.charAt(0)?.toUpperCase()}
      </Avatar>
    </Tooltip>
  )
}

interface UserJourney {
  user: User | null
}

const StyledAvatarGroup = styled(AvatarGroup)<AvatarGroupProps>({
  zIndex: 1,
  display: 'inline-flex',
  '> .MuiAvatar-root': {
    borderColor: 'primary.contrastText'
  },
  '> .MuiAvatarGroup-avatar': {
    backgroundColor: 'primary.main'
  }
})

export interface AccessAvatarsProps {
  journeyId?: string
  userJourneys?: UserJourney[]
  size?: 'small' | 'medium' | 'large'
  xsMax?: number
  smMax?: number
  showManageButton?: boolean
}

export function AccessAvatars({
  journeyId,
  userJourneys,
  size = 'small',
  xsMax = 3,
  smMax = 5,
  showManageButton = false
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
      {journeyId != null ? (
        <>
          <Stack
            direction="row"
            onClick={() => setOpen(true)}
            sx={{
              cursor: 'pointer',
              height: diameter
            }}
            role="button"
          >
            <StyledAvatarGroup
              max={xsMax}
              sx={{
                display: { xs: 'inline-flex', sm: 'none' },
                '> .MuiAvatar-root': {
                  width: diameter,
                  height: diameter,
                  fontSize,
                  borderWidth
                }
              }}
            >
              {children}
            </StyledAvatarGroup>
            <StyledAvatarGroup
              max={smMax}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                '> .MuiAvatar-root': {
                  width: diameter,
                  height: diameter,
                  fontSize,
                  borderWidth
                }
              }}
            >
              {children}
            </StyledAvatarGroup>
            {showManageButton && (
              <ManageAccessAvatar diameter={diameter} fontSize={size} />
            )}
          </Stack>
          <AccessDialog
            journeyId={journeyId}
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
                borderColor: 'primary.contrastText'
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
