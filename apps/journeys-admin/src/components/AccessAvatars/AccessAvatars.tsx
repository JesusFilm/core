import { ReactElement, useState } from 'react'
import MuiAvatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import { noop } from 'lodash'
import { AccessDialog } from '../AccessDialog'
import { GetJourneys_journeys_userJourneys as UserJourney } from '../../../__generated__/GetJourneys'
import { Avatar } from '../Avatar'
import { UserJourneyRole } from '../../../__generated__/globalTypes'

export interface AccessAvatarsProps {
  journeyId?: string
  userJourneys?: UserJourney[]
  size?: 'small' | 'medium' | 'large'
  xsMax?: number
  smMax?: number
}

export function AccessAvatars({
  journeyId,
  userJourneys,
  size = 'small',
  xsMax = 3,
  smMax = 5
}: AccessAvatarsProps): ReactElement {
  const [open, setOpen] = useState(false)
  const min = withRenderLogic({ size, max: xsMax, setOpen })
  const max = withRenderLogic({ size, max: smMax, setOpen })

  return (
    <>
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
    </>
  )
}

interface Props {
  size: 'small' | 'medium' | 'large'
  max: number
  setOpen: (open: boolean) => void
}

const withRenderLogic = ({
  size,
  max,
  setOpen
}: Props): ((values?: UserJourney[]) => ReactElement) => {
  // small default sizes
  let diameter: number
  let fontSize: number | undefined
  let borderWidth: number | undefined

  switch (size) {
    case 'small':
      diameter = 31
      fontSize = 12
      borderWidth = 1
      break
    case 'medium':
      diameter = 48
      break
    case 'large':
      diameter = 52
      break
  }

  return function withAvatarGroup(values?: UserJourney[]): ReactElement {
    const users = values?.map(
      ({ role, user }) =>
        user != null && (
          <Avatar
            user={user}
            notification={role === UserJourneyRole.inviteRequested}
            key={user.id}
          />
        )
    )

    const children = users ?? [0, 1, 2].map((i) => <MuiAvatar key={i} />)

    return (
      <Box
        onClick={values != null ? () => setOpen(true) : noop}
        sx={{
          cursor: 'pointer',
          height: diameter
        }}
        role="button"
      >
        <AvatarGroup
          max={max}
          sx={{
            '> .MuiAvatar-root': {
              width: diameter,
              height: diameter,
              fontSize,
              borderWidth,
              borderColor: '#FFF'
            },
            '> .MuiAvatarGroup-avatar': {
              backgroundColor: users != null ? 'primary.main' : 'default'
            }
          }}
        >
          {children}
        </AvatarGroup>
      </Box>
    )
  }
}
