import CircleRoundedIcon from '@mui/icons-material/CircleRounded'
import Badge from '@mui/material/Badge'
import { styled } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { JourneyCardVariant } from '../journeyCardVariant'

interface JourneyCardTextProps {
  journey: Journey
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

export function JourneyCardText({
  journey,
  variant
}: JourneyCardTextProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <StyledBadge
        invisible={variant !== JourneyCardVariant.new}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        data-testid="new-journey-badge"
        sx={{ width: '100%' }}
        badgeContent={
          <Tooltip title={t('New')}>
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
          {journey.title}
        </Typography>
      </StyledBadge>

      <Typography
        variant="caption"
        noWrap
        sx={{
          display: 'block',
          color: 'secondary.main'
        }}
        suppressHydrationWarning
      >
        {intlFormat(parseISO(journey.createdAt as string), {
          day: 'numeric',
          month: 'long',
          year: isThisYear(parseISO(String(journey.createdAt)))
            ? undefined
            : 'numeric'
        })}
        {journey.description != null && ` - ${journey.description}`}
      </Typography>
    </>
  )
}
