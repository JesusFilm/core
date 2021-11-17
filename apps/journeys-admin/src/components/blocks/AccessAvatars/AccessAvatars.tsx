import { Avatar, AvatarGroup } from '@mui/material'
import React, { ReactElement } from 'react'

export function AccessAvatars(AccessUsers: any): ReactElement {
  // TODO update prop type
  return (
    <AvatarGroup max={4}>
      {AccessUsers.map(({ id, firstName, lastName, image, email }) => (
        <Avatar key={id} alt={firstName} src={image} />
      ))}
    </AvatarGroup>
  )
}
