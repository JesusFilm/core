import { Avatar, AvatarGroup, Tooltip } from '@mui/material'
import { ReactElement } from 'react'

export interface AccessAvatar {
  id: string
  firstName?: string
  lastName?: string
  image?: string
  email?: string
}

export interface AccessAvatarsProps {
  users: AccessAvatar[]
}

export function AccessAvatars({ users }: AccessAvatarsProps): ReactElement {
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
    >
      {users.map((user) => (
        <Tooltip title={`${createToolTipTitle(user)}`} key={user.id}>
          <Avatar alt={user.firstName} src={user.image}>
            { createFallbackLetter(user) }
          </Avatar>
        </Tooltip>
      ))}
    </AvatarGroup>
  ) 
}
 
function createToolTipTitle(user: AccessAvatar): string{
  if(user.firstName !=null && user.lastName != null){
    return `${user.firstName} ${user.lastName}`
  } else if(user.email !=null){
    return `${user.email}`
  } else {
    return `No name or email available for this user`;
  }
}

function createFallbackLetter(user:AccessAvatar): string | null{
  if(user.firstName !=null){
    return `${user.firstName[0].toUpperCase()}`
  } else if(user.email !=null){
    return `${user.email[0].toUpperCase()}`
  } else {
    return null;
  }
}
