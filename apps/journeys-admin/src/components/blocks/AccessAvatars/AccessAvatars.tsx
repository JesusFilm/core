import { Avatar, AvatarGroup } from '@mui/material'
import { ReactElement } from 'react'

export function AccessAvatars(Users): ReactElement {
  // TODO update prop type
  return (
    <AvatarGroup max={4}>
      {Users.map(({ id, firstName, lastName, image, email }) => (
        <Avatar key={id} alt={firstName} src={image} />
      ))}
    </AvatarGroup>
  )
}
