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
    console.log('Click!')
  }

  const avatarConfig = {
    height: 24,
    width: 23,
    max: 3
  }

  const padding =
    users.length >= avatarConfig.max
      ? avatarConfig.max * avatarConfig.width
      : users.length - 1 * avatarConfig.width

  // console.log(`length:${users.length}, padding:${padding}`)
  return (
    <AvatarGroup
      max={avatarConfig.max}
      sx={{
        width: avatarConfig.width,
        height: avatarConfig.height,
        paddingRight: padding,
        display: 'flex',
        justifyContent: 'left'
      }}
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
