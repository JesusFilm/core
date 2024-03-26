import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

import { JourneyFields as Journey } from '../../../../../__generated__/JourneyFields'
import { MenuItem } from '../../../MenuItem/MenuItem'

interface AnalyticsProps {
  variant: 'button' | 'list-item'
  journey: Journey
}

export function Analytics({ journey, variant }: AnalyticsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <NextLink
      href={`/journeys/${journey.id}/reports`}
      passHref
      legacyBehavior
      prefetch={false}
    >
      {variant === 'button' ? (
        <Tooltip
          title={t('Analytics')}
          arrow
          sx={{
            display: {
              xs: 'none',
              md: 'flex'
            }
          }}
        >
          <IconButton aria-label="Analytics">
            <BarChartSquare3Icon />
          </IconButton>
        </Tooltip>
      ) : (
        <MenuItem label={t('Analytics')} icon={<BarChartSquare3Icon />} />
      )}
    </NextLink>
  )
}
