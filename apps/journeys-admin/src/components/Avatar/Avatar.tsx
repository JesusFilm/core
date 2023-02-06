import { ReactElement } from 'react'
import MuiAvatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { compact } from 'lodash'
import { GetMe_me as User } from '../../../__generated__/GetMe'

export interface AvatarProps {
  user: Omit<User, '__typename'>
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {}
}))

export function Avatar({ user }: AvatarProps): ReactElement {
  const displayName = compact([user.firstName, user.lastName]).join(' ')

  return (
    <Tooltip title={displayName}>
      <StyledBadge
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        color="warning"
        overlap="circular"
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`
          }
        }}
      >
        <MuiAvatar
          alt={displayName}
          src={user.imageUrl ?? undefined}
          sx={{ opacity: 0.6, background: 'secondary.light' }}
        >
          {displayName.charAt(0)?.toUpperCase()}
        </MuiAvatar>
      </StyledBadge>
    </Tooltip>
  )
}
