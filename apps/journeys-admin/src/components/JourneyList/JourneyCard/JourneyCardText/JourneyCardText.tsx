import CircleRoundedIcon from '@mui/icons-material/CircleRounded'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { JourneyCardVariant } from '../journeyCardVariant'

interface JourneyCardTextProps {
  journey: Journey
  variant: JourneyCardVariant
  loading?: boolean
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
  variant,
  loading = false
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
        <Stack direction="row" spacing="10px" alignItems="center">
          <Typography
            variant="subtitle1"
            component="div"
            noWrap
            gutterBottom
            sx={{ color: 'secondary.main' }}
          >
            {journey.title}
          </Typography>
          <CircularProgress
            size={20}
            sx={{ display: loading ? 'auto' : 'none' }}
          />
        </Stack>
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
