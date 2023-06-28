import { ReactElement } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Badge from '@mui/material/Badge'
import CircleRoundedIcon from '@mui/icons-material/CircleRounded'
import { styled } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
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
            <CircleRoundedIcon color="warning" sx={{ fontSize: '10px' }} />
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
