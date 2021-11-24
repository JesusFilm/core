import { Avatar, AvatarGroup, Tooltip } from '@mui/material'
import { ReactElement } from 'react'

export interface AccessAvatar {
  id: string
  firstName: string
  lastName: string
  image?: string
  email?: string
}

export interface AccessAvatarsProps {
  users: AccessAvatar[]
}

export function AccessAvatars({ users }: AccessAvatarsProps): ReactElement {
  function handleClick(): void {
    // TODO update this to link to access edit for journey
    console.log('Click!')
  }

  let padding = '0px'
  if (users.length === 1) {
    padding = '72px'
  } else if (users.length === 2) {
    padding = '36px'
  } else {
    padding = '0px'
  }

  return (
    <AvatarGroup
      max={3}
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingRight: padding
      }}
      onClick={handleClick}
    >
      {users.map((user) => (
        <Tooltip title={`${user.firstName} ${user.lastName}`} key={user.id}>
          <Avatar alt={user.firstName} src={user.image}>
            {user.firstName[0]}
          </Avatar>
        </Tooltip>
      ))}
    </AvatarGroup>
  )
}
