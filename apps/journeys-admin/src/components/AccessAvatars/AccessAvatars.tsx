import MuiAvatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import noop from 'lodash/noop'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import { GetAdminJourneys_journeys_userJourneys as UserJourney } from '../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../__generated__/globalTypes'
import { Avatar } from '../Avatar'

const AccessDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "AccessDialog" */
      '../AccessDialog'
    ).then((mod) => mod.AccessDialog),
  { ssr: false }
)

export interface AccessAvatarsProps {
  journeyId?: string
  userJourneys?: UserJourney[]
  size?: 'xsmall' | 'small' | 'medium' | 'large'
  max?: number
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
  max = 3
}: AccessAvatarsProps): ReactElement {
  const [open, setOpen] = useState<boolean | undefined>()
  const renderMax = withRenderLogic({
    size,
    max: max,
    setOpen
  })

  return (
    <Box>
      <Box>{renderMax(userJourneys)}</Box>

      {journeyId != null && open != null && (
        <AccessDialog
          journeyId={journeyId}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </Box>
  )
}

interface WithRenderLogicProps {
  size: 'xsmall' | 'small' | 'medium' | 'large'
  max: number
  setOpen: (open: boolean) => void
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
  setOpen
}: WithRenderLogicProps): ((values?: UserJourney[]) => ReactElement) => {
  // small default sizes
  let diameter: number
  let fontSize: number | undefined
  let borderWidth: number | undefined

  switch (size) {
    case 'xsmall':
      diameter = 26
      fontSize = 12
      borderWidth = 2
      break
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
                role={role}
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
              ml: loading ? 0 : 2,
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
        </StyledBadge>
      </Box>
    )
  }
}
