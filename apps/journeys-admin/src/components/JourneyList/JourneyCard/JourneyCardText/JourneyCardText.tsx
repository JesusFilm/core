import Badge from '@mui/material/Badge'
import Skeleton from '@mui/material/Skeleton'
import { styled } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import { ReactElement } from 'react'

import Circle from '@core/shared/ui/icons/Circle'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { JourneyCardVariant } from '../journeyCardVariant'

interface Props {
  journey?: Journey
  variant: JourneyCardVariant
}

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    left: '-11px',
    top: '13px',
    width: '10px',
    height: '10px'
  }
}))

export function JourneyCardText({ journey, variant }: Props): ReactElement {
  return (
    <>
      <StyledBadge
        invisible={variant !== JourneyCardVariant.new}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        data-testid="new-journey-badge"
        sx={{ width: '100%' }}
        badgeContent={
          <Tooltip title="New">
            <Circle color="warning" sx={{ fontSize: '10px' }} />
          </Tooltip>
        }
      >
        <Typography
          variant="subtitle1"
          component="div"
          noWrap
          gutterBottom
          sx={{ color: 'secondary.main' }}
        >
          {journey != null ? (
            journey.title
          ) : (
            <Skeleton variant="text" width={400} />
          )}
        </Typography>
      </StyledBadge>

      <Typography
        variant="caption"
        noWrap
        sx={{
          display: 'block',
          color: 'secondary.main'
        }}
      >
        {journey != null ? (
          intlFormat(parseISO(journey.createdAt), {
            day: 'numeric',
            month: 'long',
            year: isThisYear(parseISO(journey.createdAt))
              ? undefined
              : 'numeric'
          })
        ) : (
          <Skeleton variant="text" width={120} />
        )}
        {journey?.description != null && ` - ${journey.description}`}
      </Typography>
    </>
  )
}
