import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import { useBreakpoints } from '@core/shared/ui'
import { GetJourneys_journeys_userJourneys_user } from '../../../../../__generated__/GetJourneys'

export interface AccessAvatarsProps {
  users: Array<GetJourneys_journeys_userJourneys_user | null>
}

export function AccessAvatars({ users }: AccessAvatarsProps): ReactElement {
  const breakpoints = useBreakpoints()

  const maxAvatars = breakpoints.md ? 5 : 3
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
            <Tooltip title={createToolTip(user)} key={user.id}>
              <Avatar
                sx={{ width: 31, height: 31 }}
                alt={user.firstName}
                src={user.imageUrl ?? undefined}
              >
                {user.firstName[0].toUpperCase()}
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
                  {createToolTip(user)}
                </p>
              )
            )
          })}
        >
          <Avatar
            sx={{
              backgroundColor: 'primary',
              width: 31,
              height: 31,
              fontSize: 12
            }}
            alt="overflow avatar"
          >{`+${users.slice(avatarsShown).length}`}</Avatar>
        </Tooltip>
      )}
    </AvatarGroup>
  )
}

function createToolTip(user: GetJourneys_journeys_userJourneys_user): string {
  let toolTip = user.firstName
  if (user.lastName != null) {
    toolTip += ` ${user.lastName}`
  }
  return toolTip
}
