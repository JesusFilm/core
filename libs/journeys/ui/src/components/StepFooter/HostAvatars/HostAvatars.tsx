import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'

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
        <AvatarGroup spacing="small" data-testId='journeys-avatars'>
          {src1 != null && <Avatar src={src1} />}
          {src2 != null && <Avatar src={src2} />}
        </AvatarGroup>
      )}
      {src1 == null && src2 == null && admin ? (
        <AccountCircleOutlinedIcon
        
          sx={{
            height: '44px',
            width: '44px',
            color: 'secondary.light'
          }}
        />
      ) : (src1 == null || src2 == null) && admin ? (
        <AvatarGroup spacing="small" data-testId = 'journeys-admin-render-one-avatar'>
          <Avatar src={src1 == null && src2 != null ? src2 : src1} />
          <Avatar>
            <AccountCircleOutlinedIcon  />
          </Avatar>
        </AvatarGroup>
      ) : (
        admin && (<AvatarGroup spacing="small" data-testId='journeys-admin-render-two-avatars'>
          <Avatar src={src1} />
          <Avatar src={src2} />
        </AvatarGroup>)
      )}
    </>
  )
}
