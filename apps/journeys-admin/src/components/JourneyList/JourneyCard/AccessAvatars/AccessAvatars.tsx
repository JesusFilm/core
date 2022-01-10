import { ReactElement } from 'react'
import { Avatar, AvatarGroup, Tooltip } from '@mui/material'
import { createToolTipTitle, createFallbackLetter } from './utils'
import { useBreakpoints } from '@core/shared/ui'
import { GetJourneys_journeys_userJourneys_user } from '../../../../../__generated__/GetJourneys'

export interface AccessAvatarsProps {
  users: Array<GetJourneys_journeys_userJourneys_user | null>
}

export function AccessAvatars({ users }: AccessAvatarsProps): ReactElement {
  const breakpoints = useBreakpoints()

  const maxAvatars = breakpoints.sm ? 5 : 3
  const avatarsShown = users.length <= maxAvatars ? maxAvatars : maxAvatars - 1

  return (
    <AvatarGroup
      sx={{
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      {users.slice(0, avatarsShown).map(
        (user) =>
          user != null && (
            <Tooltip title={`${createToolTipTitle(user)}`} key={user.id}>
              <Avatar
                sx={{ width: 31, height: 31 }}
                alt={user.firstName}
                src={user.imageUrl ?? undefined}
              >
                {createFallbackLetter(user)}
              </Avatar>
            </Tooltip>
          )
      )}
      {maxAvatars > avatarsShown && (
        <Tooltip
          title={users.slice(avatarsShown).map((user) => {
            return (
              user != null && (
                <p key={user.id} style={{ margin: '0px' }}>
                  {createToolTipTitle(user)}
                </p>
              )
            )
          })}
        >
          <Avatar
            sx={{ backgroundColor: 'primary', width: 31, height: 31 }}
            alt="overflow avatar"
          >{`+${users.slice(avatarsShown).length}`}</Avatar>
        </Tooltip>
      )}
    </AvatarGroup>
  )
}
