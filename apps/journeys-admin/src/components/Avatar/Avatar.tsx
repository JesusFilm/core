import MuiAvatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import { SxProps } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import compact from 'lodash/compact'
import { ReactElement } from 'react'

import { GetAdminJourneys_journeys_userJourneys_user as User } from '../../../__generated__/GetAdminJourneys'

export interface AvatarProps {
  user: User
  notification?: boolean
  sx?: SxProps
}

export function Avatar({
  user,
  notification = false,
  sx
}: AvatarProps): ReactElement {
  const displayName = compact([user.firstName, user.lastName]).join(' ')

  return (
    <Tooltip title={displayName}>
      <Badge
        invisible={!notification}
        color="warning"
        variant="dot"
        overlap="circular"
        aria-label="notification-badge"
        sx={{
          '> .MuiBadge-badge': {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`
          }
        }}
      >
        <MuiAvatar
          alt={displayName}
          src={user.imageUrl ?? undefined}
          data-testid="avatar"
          sx={{
            ...sx,
            filter: notification
              ? 'grayscale(80%) brightness(1.2) sepia(0.1)'
              : ''
          }}
        >
          {displayName.charAt(0)?.toUpperCase()}
        </MuiAvatar>
      </Badge>
    </Tooltip>
  )
}
