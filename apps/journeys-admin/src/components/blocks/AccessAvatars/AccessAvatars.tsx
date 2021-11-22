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

const avatarSize = {
  height: 24,
  width: 23
}

export function AccessAvatars({ users }: AccessAvatarsProps): ReactElement {
  function handleClick(): void {
    console.log('Click!')
  }

  return (
    <AvatarGroup
      max={3}
      sx={{ width: avatarSize.width, height: avatarSize.height }}
      onClick={handleClick}
    >
      {users?.map((user) => (
        <Tooltip title={`${user.firstName} ${user.lastName}`} key={user.id}>
          <Avatar alt={user.firstName} src={user.image}>
            {user.firstName[0]}
          </Avatar>
        </Tooltip>
      ))}
    </AvatarGroup>
  )
}
