import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { ReactElement } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'
import UserProfile2 from '@core/shared/ui/icons/UserProfile2'

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
      spacing={size === 'small' ? (rtl ? 0 : 12) : 24}
      data-testid="host-avatars"
      sx={{
        '.MuiAvatar-root': {
          borderWidth: '1px',
          mr: rtl ? -1 : 0,
          '.MuiAvatar-colorDefault': {
            borderWidth: '2px'
          }
        }
      }}
    >
      {src1 != null && (
        <Avatar
          src={src1}
          sx={{
            height: size === 'small' ? '30px' : '48px',
            width: size === 'small' ? '30px' : '48px'
          }}
        />
      )}
      {src2 != null && (
        <Avatar
          src={src2}
          sx={{
            height: size === 'small' ? '30px' : '48px',
            width: size === 'small' ? '30px' : '48px'
          }}
        />
      )}
      {(src1 == null || src2 == null) &&
        hasPlaceholder === true &&
        editableStepFooter &&
        size === 'small' && (
          <Avatar
            sx={{
              color: 'secondary.light',
              opacity: 0.5,
              backgroundColor: 'transparent',
              '&.MuiAvatar-root': {
                border: (theme) => `2px dashed ${theme.palette.grey[700]}`,
                height: '27px',
                width: '27px'
              }
            }}
          >
            <UserProfile2
              data-testid="host-avatar-placeholder"
              sx={{ color: (theme) => theme.palette.grey[700] }}
            />
          </Avatar>
        )}
      {src1 == null &&
        src2 == null &&
        hasPlaceholder === true &&
        size === 'large' && (
          <Avatar
            sx={{
              color: 'secondary.light',
              opacity: 0.5,
              backgroundColor: 'transparent',
              '&.MuiAvatar-root': {
                border: (theme) => `2px solid ${theme.palette.grey[700]}`,
                height: '46px',
                width: '46px'
              }
            }}
          >
            <UserProfile2
              data-testid="host-avatar-placeholder-solid"
              sx={{ color: (theme) => theme.palette.grey[700] }}
            />
          </Avatar>
        )}
    </AvatarGroup>
  )
}
