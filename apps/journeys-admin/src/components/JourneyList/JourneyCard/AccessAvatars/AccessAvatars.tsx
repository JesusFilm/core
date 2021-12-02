import { Avatar, AvatarGroup, Tooltip } from '@mui/material'
import { ReactElement } from 'react'

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

function createToolTipTitle(user: AccessAvatar): string {
  if (user.firstName != null && user.lastName != null) {
    return `${user.firstName} ${user.lastName}`
  } else if (user.email != null) {
    return `${user.email}`
  } else {
    return 'Anonymous'
  }
}

function createFallbackLetter(user: AccessAvatar): string | null {
  if (user.firstName != null) {
    return `${user.firstName[0].toUpperCase()}`
  } else if (user.email != null) {
    return `${user.email[0].toUpperCase()}`
  } else {
    return null
  }
}

function orderAvatars(users: AccessAvatar[]): AccessAvatar[] {
  const owners = users.filter((user) => user.role === Role.owner)
  const editors = users.filter((user) => user.role === Role.editor)
  const inviteRequests = users.filter(
    (user) => user.role === Role.inviteRequested
  )
  return owners.concat(editors).concat(inviteRequests)
}
