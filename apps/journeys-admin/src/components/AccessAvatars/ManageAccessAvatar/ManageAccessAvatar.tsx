import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import { ReactElement } from 'react'

import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

export interface ManageAccessAvatarProps {
  diameter: number
  fontSize: 'small' | 'inherit' | 'large' | 'medium' | undefined
}

export function ManageAccessAvatar({
  diameter,
  fontSize
}: ManageAccessAvatarProps): ReactElement {
  return (
    <Tooltip title="Manage Access">
      <Avatar
        alt="Manage Access"
        sx={{
          backgroundColor: 'primary.contrastText',
          border: '2px solid',
          borderColor: 'divider',
          ml: -2,
          width: diameter,
          height: diameter,
          boxSizing: 'content-box',
          '&:hover': {
            backgroundColor: 'divider'
          }
        }}
        data-testid="ManageAccessAvatar"
      >
        <UsersProfiles2Icon
          sx={{ color: 'secondary.light' }}
          fontSize={fontSize}
        />
      </Avatar>
    </Tooltip>
  )
}
