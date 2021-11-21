import { Avatar, AvatarGroup, Tooltip } from '@mui/material'
import { ReactElement } from 'react'

export interface AvatarProps {
  id: string
  firstName: string
  lastName: string
  image?: string
  email?: string
}

export interface AvatarsArray {
  accessAvatarsProps: AvatarProps[]
}

export function AccessAvatars({
  accessAvatarsProps
}: AvatarsArray): ReactElement {
  function handleClick(user: AvatarProps): void {
    console.log(`You clicked ${user.firstName}`)
  }

  return (
    <div style={avatarGroupStyle}>
      <AvatarGroup max={4} sx={{ width: 23, height: 24 }}>
        {accessAvatarsProps?.map((user) => (
          <Tooltip title={`${user.firstName} ${user.lastName}`} key={user.id}>
            <Avatar
              onClick={() => handleClick(user)}
              alt={user.firstName}
              src={user.image}
            />
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
