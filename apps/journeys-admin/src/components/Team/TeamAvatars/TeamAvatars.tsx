import AvatarGroup from '@mui/material/AvatarGroup'
import MuiAvatar from '@mui/material/Avatar'
import { ReactElement } from 'react'
import UserProfileAdd from '@core/shared/ui/icons/UserProfileAdd'
import Box from '@mui/material/Box'
import { GetLastActiveTeamIdAndTeams_teams_userTeams as UserTeam } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { take } from 'lodash'
import { Avatar } from '../../Avatar'

interface TeamAvatarsProps {
  onClick?: () => void
  size?: string
  userTeams: UserTeam[]
}

export function TeamAvatars({
  onClick,
  size = 'small',
  userTeams
}: TeamAvatarsProps): ReactElement {
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: onClick != null ? 'pointer' : 'default'
      }}
    >
      <AvatarGroup
        total={userTeams.length + 1}
        spacing={8}
        sx={{
          '.MuiAvatar-root': {
            borderWidth: '1px',
            fontSize: 12
          }
        }}
      >
        {take(userTeams, 5).map(({ user }) => (
          <Avatar
            key={user.id}
            user={user}
            sx={{
              width: size === 'small' ? '22px' : '30px',
              height: size === 'small' ? '22px' : '30px'
            }}
          />
        ))}

        {onClick != null && (
          <MuiAvatar
            sx={{
              width: size === 'small' ? '22px' : '30px',
              height: size === 'small' ? '22px' : '30px',
              backgroundColor: 'secondary.contrastText'
            }}
          >
            <UserProfileAdd sx={{ color: 'secondary.light', width: '18px' }} />
          </MuiAvatar>
        )}
      </AvatarGroup>
    </Box>
  )
}
