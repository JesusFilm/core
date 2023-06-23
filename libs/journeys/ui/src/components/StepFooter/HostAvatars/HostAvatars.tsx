import { ReactElement } from 'react'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import UserProfile3 from '@core/shared/ui/icons/UserProfile3'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { useJourney } from '../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../libs/rtl'

interface HostAvatarsProps {
  hasPlaceholder?: boolean
  size?: 'small' | 'large'
  avatarSrc1?: string | null
  avatarSrc2?: string | null
}

export function HostAvatars({
  hasPlaceholder,
  size = 'small',
  avatarSrc1,
  avatarSrc2
}: HostAvatarsProps): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const { editableStepFooter } = useFlags()
  const src1 = avatarSrc1 ?? journey?.host?.src1
  const src2 = avatarSrc2 ?? journey?.host?.src2

  return (
    <AvatarGroup
      spacing={19}
      data-testid="host-avatars"
      sx={{ flexDirection: rtl ? 'row' : 'row-reverse' }}
    >
      {src1 != null && (
        <Avatar
          src={src1}
          sx={{
            height: size === 'small' ? '40px' : '48px',
            width: size === 'small' ? '40px' : '48px'
          }}
        />
      )}
      {src2 != null && (
        <Avatar
          src={src2}
          sx={{
            height: size === 'small' ? '40px' : '48px',
            width: size === 'small' ? '40px' : '48px'
          }}
        />
      )}
      {(src1 == null || src2 == null) &&
        hasPlaceholder &&
        editableStepFooter &&
        size === 'small' && (
          <Avatar
            sx={{
              color: 'secondary.light',
              opacity: 0.5,
              backgroundColor: 'transparent',
              '&.MuiAvatar-root': {
                border: '2px dashed',
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
                height: size === 'small' ? '34px' : '42px',
                width: size === 'small' ? '34px' : '42px',
                color: (theme) => theme.palette.grey[700]
              }}
            />
          </Avatar>
        )}
      {src1 == null && src2 == null && hasPlaceholder && size === 'large' && (
        <Avatar
          sx={{
            color: 'secondary.light',
            opacity: 0.5,
            backgroundColor: 'transparent',
            '&.MuiAvatar-root': {
              border: '3px solid',
              borderColor: (theme) => theme.palette.grey[700],
              height: '44px',
              width: '44px'
            }
          }}
        >
          <UserProfile3
            data-testid="host-avatar-placeholder-solid"
            sx={{
              pr: rtl ? '4px' : '0px',
              pl: rtl ? '0px' : '4px',
              pt: '6px',
              color: (theme) => theme.palette.grey[700]
            }}
          />
        </Avatar>
      )}
    </AvatarGroup>
  )
}
