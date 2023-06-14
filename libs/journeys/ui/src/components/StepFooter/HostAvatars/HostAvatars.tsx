import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import UserProfile3 from '@core/shared/ui/icons/UserProfile3'

interface HostAvatarsProps {
  src1?: string
  src2?: string
  admin: boolean
}

export const HostAvatars = ({
  src1,
  src2,
  admin
}: HostAvatarsProps): ReactElement => {
  return (
    <>
      {(src1 != null || src2 != null) && !admin && (
        <AvatarGroup
          spacing="small"
          data-testid="journeys-avatars"
          sx={{ pr: 2 }}
        >
          {src1 != null && <Avatar src={src1} />}
          {src2 != null && <Avatar src={src2} />}
        </AvatarGroup>
      )}
      {src1 == null && src2 == null && admin ? (
        <Avatar
          sx={{
            pr: 2,
            height: '44px',
            width: '44px',
            color: 'secondary.light',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            outline: 'none',
            border: '3px dashed #6D6D7D'
          }}
        >
          <UserProfile3
            data-testid="account-circled-out-icon"
            sx={{
              pl: '6px',
              pt: '6px',
              height: '34px',
              width: '34px',
              color: 'secondary.light'
            }}
          />
        </Avatar>
      ) : (src1 == null || src2 == null) && admin ? (
        <AvatarGroup
          spacing="small"
          data-testid="journeys-admin-render-one-avatar"
          sx={{ pr: 2 }}
        >
          <Avatar src={src1 == null && src2 != null ? src2 : src1} />
          <Avatar
            sx={{
              color: 'secondary.light',
              backgroundColor: 'rgba(0, 0, 0, 0)',
              outline: 'none',
              border: '3px dashed #6D6D7D',
              '&.MuiAvatar-root': {
                border: '3px dashed #6D6D7D',
                height: '36px',
                width: '36px'
              }
            }}
          >
            <UserProfile3
              data-testid="account-circled-out-icon"
              sx={{
                pl: '6px',
                pt: '6px',
                height: '34px',
                width: '34px',
                color: 'secondary.light'
              }}
            />
          </Avatar>
        </AvatarGroup>
      ) : (
        admin && (
          <AvatarGroup
            spacing="small"
            data-testid="journeys-admin-render-two-avatars"
            sx={{ pr: 2 }}
          >
            <Avatar src={src1} />
            <Avatar src={src2} />
          </AvatarGroup>
        )
      )}
    </>
  )
}
