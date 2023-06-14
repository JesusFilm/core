import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import UserProfileCircle from '@core/shared/ui/icons/UserProfileCircle'

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
        <AvatarGroup spacing="small" data-testid="journeys-avatars">
          {src1 != null && <Avatar src={src1} />}
          {src2 != null && <Avatar src={src2} />}
        </AvatarGroup>
      )}
      {src1 == null && src2 == null && admin ? (
        <UserProfileCircle
          data-testid="account-circled-out-icon"
          sx={{
            height: '44px',
            width: '44px',
            color: 'secondary.light'
          }}
        />
      ) : (src1 == null || src2 == null) && admin ? (
        <AvatarGroup
          spacing="small"
          data-testid="journeys-admin-render-one-avatar"
        >
          <Avatar src={src1 == null && src2 != null ? src2 : src1} />
          <UserProfileCircle
            data-testid="account-circled-out-icon"
            sx={{
              height: '44px',
              width: '44px',
              color: 'secondary.light'
            }}
          />
        </AvatarGroup>
      ) : (
        admin && (
          <AvatarGroup
            spacing="small"
            data-testid="journeys-admin-render-two-avatars"
          >
            <Avatar src={src1} />
            <Avatar src={src2} />
          </AvatarGroup>
        )
      )}
    </>
  )
}
