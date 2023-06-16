import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import UserProfile3 from '@core/shared/ui/icons/UserProfile3'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { useJourney } from '../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../libs/rtl'

export function HostAvatars(): ReactElement {
  const { journey, admin } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const { editableStepFooter } = useFlags()

  const src1 = 'http://surl.li/iauzf'
  // const src2 = 'http://surl.li/iauzv'
  const src2 = undefined

  return (
    <>
      <AvatarGroup
        spacing={19}
        data-testid="host-avatars"
        sx={{ flexDirection: rtl ? 'row' : 'row-reverse' }}
      >
        {src1 != null && <Avatar src={src1} />}
        {src2 != null && <Avatar src={src2} />}
        {(src1 == null || src2 == null) && admin && editableStepFooter && (
          <Avatar
            sx={{
              color: 'secondary.light',
              backgroundColor: 'transparent',
              '&.MuiAvatar-root': {
                border: '3px dashed',
                borderColor: (theme) => theme.palette.grey[700],
                height: '36px',
                width: '36px'
              }
            }}
          >
            <UserProfile3
              data-testid="host-avatar-placeholder"
              sx={{
                pr: rtl ? '6px' : '0px',
                pl: rtl ? '0px' : '6px',
                pt: '6px',
                height: '34px',
                width: '34px',
                color: (theme) => theme.palette.grey[700]
              }}
            />
          </Avatar>
        )}
      </AvatarGroup>
    </>
  )
}
