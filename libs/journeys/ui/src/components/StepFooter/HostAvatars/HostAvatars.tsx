import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import UserProfile3 from '@core/shared/ui/icons/UserProfile3'
import { useJourney } from '../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../libs/rtl'

interface HostAvatarsProps {
  src1?: string
  src2?: string
}

export const HostAvatars = ({ src1, src2 }: HostAvatarsProps): ReactElement => {
  const { journey, admin } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  console.log(rtl)
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
            border: '3px dashed ',
            borderColor: 'secondary.light'
          }}
        >
          <UserProfile3
            data-testid="account-circled-out-icon"
            sx={{
              pl: rtl ? '0px' : '6px',
              pr: rtl ? '6px' : '0px',
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
              '&.MuiAvatar-root': {
                border: '3px dashed',
                borderColor: 'secondary.light',

                height: '36px',
                width: '36px'
              }
            }}
          >
            <UserProfile3
              data-testid="account-circled-out-icon"
              sx={{
                pr: rtl ? '6px' : '0px',
                pl: rtl ? '0px' : '6px',
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
