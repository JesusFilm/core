import MuiAvatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import { SxProps } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import compact from 'lodash/compact'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { GetAdminJourneys_journeys_userJourneys_user as ApiUser } from '../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'

export interface AvatarProps {
  apiUser: ApiUser
  notification?: boolean
  sx?: SxProps
  role?: UserJourneyRole
}

export function Avatar({
  apiUser,
  notification = false,
  sx,
  role
}: AvatarProps): ReactElement {
  const displayName = compact([apiUser.firstName, apiUser.lastName]).join(' ')
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Tooltip
      title={
        role !== UserJourneyRole.inviteRequested
          ? displayName
          : t('User with Requested Access')
      }
      data-testid="JourneysAdminAvatar"
      arrow
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -8]
              }
            }
          ]
        }
      }}
    >
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
          src={apiUser.imageUrl ?? undefined}
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
