import { Avatar, AvatarGroup } from '@mui/material'
import { ReactElement } from 'react'

export interface AvatarProps {
  id: string
  firstName: string
  lastName?: string
  image?: string
  email: string
}

export interface AvatarsArray {
  accessAvatarsProps: AvatarProps[]
}

export function AccessAvatars({
  accessAvatarsProps
}: AvatarsArray): ReactElement {
  return (
    <AvatarGroup max={4}>
      {accessAvatarsProps?.map((user) => (
        <Avatar key={user.id} alt={user.firstName} src={user.image} />
      ))}
    </AvatarGroup>
  )
}
