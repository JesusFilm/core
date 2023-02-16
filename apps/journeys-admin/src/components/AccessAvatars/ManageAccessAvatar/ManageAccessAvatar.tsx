import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded'

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
      >
        <GroupAddRoundedIcon
          sx={{ color: 'secondary.light' }}
          fontSize={fontSize}
        />
      </Avatar>
    </Tooltip>
  )
}
