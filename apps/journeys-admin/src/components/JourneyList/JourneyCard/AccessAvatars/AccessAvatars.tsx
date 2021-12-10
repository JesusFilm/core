import { ReactElement } from 'react'
import { Avatar, AvatarGroup, Tooltip, useTheme } from '@mui/material'

import { createToolTipTitle, createFallbackLetter, orderAvatars } from './utils'
import { useBreakpoints } from '@core/shared/ui'

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
  editor = 'editor',
  owner = 'owner'
}

export interface AccessAvatarsProps {
  users: AccessAvatar[]
}

export function AccessAvatars({ users }: AccessAvatarsProps): ReactElement {
  const theme = useTheme()
  const breakpoints = useBreakpoints()

  const orderedAvatars = orderAvatars(users)
  const maxAvatars = breakpoints.sm ? 5 : 3
  const avatarsShown =
    orderedAvatars.length <= maxAvatars ? maxAvatars : maxAvatars - 1

  return (
    <AvatarGroup
      sx={{
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      {orderedAvatars.slice(0, avatarsShown).map((user) => (
        <Tooltip title={`${createToolTipTitle(user)}`} key={user.id}>
          <Avatar alt={user.firstName} src={user.image}>
            {createFallbackLetter(user)}
          </Avatar>
        </Tooltip>
      ))}
      {maxAvatars > avatarsShown && (
        <Tooltip
          title={orderedAvatars.slice(avatarsShown).map((user) => {
            return (
              <p key={user.id} style={{ margin: '0px' }}>
                {createToolTipTitle(user)}
              </p>
            )
          })}
        >
          <Avatar
            sx={{ backgroundColor: theme.palette.primary.main }}
            alt="overflow avatar"
          >{`+${users.slice(avatarsShown).length}`}</Avatar>
        </Tooltip>
      )}
    </AvatarGroup>
  )
}
