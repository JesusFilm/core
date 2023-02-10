import { ReactElement } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Badge from '@mui/material/Badge'
import { styled } from '@mui/material/styles'
import { GetJourneys_journeys as Journey } from '../../../../../__generated__/GetJourneys'
import { JourneyCardVariant } from '../JourneyCard'

interface Props {
  journey?: Journey
  variant: JourneyCardVariant
}

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    left: '-11x',
    top: '13px',
    width: '10px',
    height: '10px',
    'border-radius': '50%'
  }
}))

export function JourneyCardText({ journey, variant }: Props): ReactElement {
  return (
    <>
      <StyledBadge
        color="warning"
        variant="dot"
        invisible={variant !== JourneyCardVariant.new}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
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
            <Skeleton variant="text" width={200} />
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
