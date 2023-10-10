import MuiAvatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import noop from 'lodash/noop'
import { ReactElement, useState } from 'react'

import { GetAdminJourneys_journeys_userJourneys as UserJourney } from '../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { AccessDialog } from '../AccessDialog'
import { Avatar } from '../Avatar'

import { ManageAccessAvatar } from './ManageAccessAvatar/ManageAccessAvatar'

export interface AccessAvatarsProps {
  journeyId?: string
  userJourneys?: UserJourney[]
  size?: 'small' | 'medium' | 'large'
  xsMax?: number
  smMax?: number
  showManageButton?: boolean
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '> .MuiBadge-badge': {
    top: '14%',
    right: '3%',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
  }
}))

export function AccessAvatars({
  journeyId,
  userJourneys,
  size = 'small',
  xsMax = 3,
  smMax = 5,
  showManageButton = false
}: AccessAvatarsProps): ReactElement {
  const [open, setOpen] = useState(false)
  const min = withRenderLogic({ size, max: xsMax, setOpen, showManageButton })
  const max = withRenderLogic({ size, max: smMax, setOpen, showManageButton })

  return (
    <Box>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        {min(userJourneys)}
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        {max(userJourneys)}
      </Box>

      {journeyId != null && (
        <AccessDialog
          journeyId={journeyId}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </Box>
  )
}

interface Props {
  size: 'small' | 'medium' | 'large'
  max: number
  setOpen: (open: boolean) => void
  showManageButton: boolean
}

const sortByOwner = (values: UserJourney[] = []): UserJourney[] => {
  const ownerJourneys = values?.filter(
    (userJourney) => userJourney.role === UserJourneyRole.owner
  )
  const remainingJourneys = values?.filter(
    (userJourney) => userJourney.role !== UserJourneyRole.owner
  )
  return ownerJourneys.concat(remainingJourneys)
}

const withRenderLogic = ({
  size,
  max,
  setOpen,
  showManageButton
}: Props): ((values?: UserJourney[]) => ReactElement) => {
  // small default sizes
  let diameter: number
  let fontSize: number | undefined
  let borderWidth: number | undefined

  switch (size) {
    case 'small':
      diameter = 31
      fontSize = 12
      borderWidth = 2
      break
    case 'medium':
      diameter = 48
      break
    case 'large':
      diameter = 52
      break
  }

  return function withAvatarGroup(values?: UserJourney[]): ReactElement {
    const loading = values == null
    let invisible = true
    const maxIndex = max <= 2 ? 0 : max - 2
    const users = sortByOwner(values)

    const children = loading
      ? [0, 1, 2].map((i) => {
          return (
            <MuiAvatar key={i}>
              <Skeleton
                variant="circular"
                height={diameter}
                width={diameter}
                animation={false}
                sx={{ bgcolor: 'divider' }}
              />
            </MuiAvatar>
          )
        })
      : users?.map(({ role, user }, index) => {
          if (
            index > maxIndex &&
            role === UserJourneyRole.inviteRequested &&
            invisible
          ) {
            invisible = false
          }
          return (
            user != null && (
              <Avatar
                apiUser={user}
                notification={role === UserJourneyRole.inviteRequested}
                key={user.id}
              />
            )
          )
        })

    return (
      <Box
        onClick={values != null ? () => setOpen(true) : noop}
        sx={{
          cursor: 'pointer',
          height: diameter
        }}
        role="button"
        data-testid="JourneysAdminAccessAvatars"
      >
        <StyledBadge
          color="warning"
          variant="dot"
          invisible={invisible}
          aria-label="overflow-notification-badge"
        >
          <AvatarGroup
            max={max}
            sx={{
              zIndex: 1,
              '& .MuiAvatar-root': {
                width: diameter,
                height: diameter,
                fontSize,
                borderWidth,
                borderColor: 'primary.contrastText'
              },
              '> .MuiAvatarGroup-avatar': {
                backgroundColor: 'primary.main'
              }
            }}
          >
            {children}
          </AvatarGroup>

          {showManageButton && (
            <ManageAccessAvatar diameter={diameter} fontSize={size} />
          )}
        </StyledBadge>
      </Box>
    )
  }
}
