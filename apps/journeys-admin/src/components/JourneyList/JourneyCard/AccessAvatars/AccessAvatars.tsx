import { Avatar, AvatarGroup, Tooltip } from '@mui/material'
import { ReactElement } from 'react'

import {
  createToolTipTitle,
  createFallbackLetter,
  orderAvatars
} from './AccessAvatarsHelpers'

// import from types when the backend is ready
export interface AccessAvatar {
  id: string
  firstName?: string
  lastName?: string
  image?: string
  email?: string
  role: Role
}

export enum Role {
  inviteRequested = 'inviteRequested',
  editor = 'editor',
  owner = 'owner'
}

export interface AccessAvatarsProps {
  users: AccessAvatar[]
}

export function AccessAvatars({ users }: AccessAvatarsProps): ReactElement {
  const orderedAvatars = orderAvatars(users)

  if (orderedAvatars.length <= 3) {
    return (
      <AvatarGroup
        sx={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        {orderedAvatars.slice(0, 3).map((user) => (
          <Tooltip title={`${createToolTipTitle(user)}`} key={user.id}>
            <Avatar alt={user.firstName} src={user.image}>
              {createFallbackLetter(user)}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
    )
  } else {
    return (
      <AvatarGroup
        sx={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        {orderedAvatars.slice(0, 2).map((user) => (
          <Tooltip title={`${createToolTipTitle(user)}`} key={user.id}>
            <Avatar alt={user.firstName} src={user.image}>
              {createFallbackLetter(user)}
            </Avatar>
          </Tooltip>
        ))}
        <Tooltip
          title={orderedAvatars.slice(3).map((user) => {
            return (
              <>
                <p style={{ margin: '0px' }}>{createToolTipTitle(user)}</p>
              </>
            )
          })}
        >
          <Avatar>{`+${users.slice(3).length}`}</Avatar>
        </Tooltip>
      </AvatarGroup>
    )
  }
}
