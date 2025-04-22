import CircleRoundedIcon from '@mui/icons-material/CircleRounded'
import Badge from '@mui/material/Badge'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'
import { JourneyCardVariant } from '../journeyCardVariant'

import { LastModifiedDate } from './LastModifiedDate'

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
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Globe1Icon sx={{ fontSize: 13 }} />
        <Typography variant="caption">
          {journey.language.name.find(({ primary }) => primary)?.value}
        </Typography>
        <Typography variant="caption" sx={{ mx: 1 }}>•</Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{
            display: 'block',
            color: 'secondary.main'
          }}
          suppressHydrationWarning
        >
          <LastModifiedDate modifiedDate={journey.updatedAt} />
        </Typography>
      </Stack>
    </>
  )
}
