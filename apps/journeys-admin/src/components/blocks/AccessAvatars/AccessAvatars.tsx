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
  function handleClick(user: AccessAvatar): void {
    console.log(`You clicked ${user.firstName}`)
  }

  return (
    <div style={avatarGroupStyle}>
      <AvatarGroup max={3} sx={{ width: 23, height: 24 }}>
        {users?.map((user) => (
          <Tooltip title={`${user.firstName} ${user.lastName}`} key={user.id}>
            <Avatar
              onClick={() => handleClick(user)}
              alt={user.firstName}
              src={user.image}
            >
              {user.firstName[0]}
            </Avatar>
          </Tooltip>
        ))}
      </AvatarGroup>
    </div>
  )
}

const avatarGroupStyle = {
  display: 'flex',
  justifyContent: 'center'
}
