import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { ReactElement } from 'react'

import UserProfile3Icon from '@core/shared/ui/icons/UserProfile3'

import { useJourney } from '../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../libs/rtl'

function Placeholder(): ReactElement {
  return (
    <Avatar
      sx={{
        background: 'background.paper',
        opacity: 0.6,
        '&.MuiAvatar-root': {
          border: 'none',
          height: '32px',
          width: '32px'
        }
      }}
    >
      <UserProfile3Icon
        data-testid="host-avatar-active"
        sx={{ color: (theme) => theme.palette.secondary.contrastText }}
      />
    </Avatar>
  )
}

interface HostAvatarsProps {
  hasPlaceholder?: boolean
  size?: 'small' | 'large'
  avatarSrc1?: string | null
  avatarSrc2?: string | null
  live?: boolean
}

export function HostAvatars({
  hasPlaceholder,
  size = 'small',
  avatarSrc1,
  avatarSrc2,
  live
}: HostAvatarsProps): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)

  const isEmpty = avatarSrc1 == null && avatarSrc2 == null

  function render(): ReactElement | null {
    if (isEmpty && size === 'large') return null

    return journey?.showHosts !== true && live !== true ? (
      <Placeholder />
    ) : (
      <>
        {avatarSrc2 != null && (
          <Avatar
            src={avatarSrc2}
            sx={{
              height: size === 'small' ? '30px' : '48px',
              width: size === 'small' ? '30px' : '48px'
            }}
          />
        )}
        {avatarSrc1 != null && (
          <Avatar
            src={avatarSrc1}
            sx={{
              height: size === 'small' ? '30px' : '48px',
              width: size === 'small' ? '30px' : '48px'
            }}
          />
        )}
      </>
    )
  }

  return (
    <AvatarGroup
      spacing={size === 'small' ? (rtl ? 0 : 12) : 24}
      data-testid="StepFooterHostAvatars"
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
      {render()}
      {(avatarSrc1 == null || avatarSrc2 == null) &&
        hasPlaceholder === true &&
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
            <UserProfile3Icon
              data-testid="host-avatar-placeholder"
              sx={{ color: (theme) => theme.palette.grey[700] }}
            />
          </Avatar>
        )}
      {avatarSrc1 == null &&
        avatarSrc2 == null &&
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
            <UserProfile3Icon
              data-testid="host-avatar-placeholder-solid"
              sx={{ color: (theme) => theme.palette.grey[700] }}
            />
          </Avatar>
        )}
    </AvatarGroup>
  )
}
