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
  const maxAvatars = 3
  const avatarsShown =
    orderedAvatars.length <= maxAvatars ? maxAvatars : maxAvatars - 1

  return (
    <AvatarGroup
      sx={{
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      {orderedAvatars.slice(0, avatarsShown).map((user) => (
        <Tooltip title={`${createToolTipTitle(user)}`} key={user.id}>
          <Avatar alt={user.firstName} src={user.image}>
            {createFallbackLetter(user)}
          </Avatar>
        </Tooltip>
      ))}
      {maxAvatars > avatarsShown && (
        <Tooltip
          title={orderedAvatars.slice(avatarsShown).map((user) => {
            return (
              <>
                <p style={{ margin: '0px' }}>{createToolTipTitle(user)}</p>
              </>
            )
          })}
        >
          <Avatar alt="overflow avatar">{`+${
            users.slice(avatarsShown).length
          }`}</Avatar>
        </Tooltip>
      )}
    </AvatarGroup>
  )
}
