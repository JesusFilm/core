import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

import { JourneyFields as Journey } from '../../../../../__generated__/JourneyFields'
import { MenuItem } from '../../../MenuItem/MenuItem'

interface AnalyticsProps {
  variant: 'button' | 'list-item'
  journey: Journey
}

export function Analytics({ journey, variant }: AnalyticsProps): ReactElement {
  return (
    <NextLink
      href={`/journeys/${journey.id}/reports`}
      passHref
      legacyBehavior
      prefetch={false}
    >
      {variant === 'button' ? (
        <Tooltip title="Analytics" arrow>
          <IconButton>
            <BarChartSquare3Icon />
          </IconButton>
        </Tooltip>
      ) : (
        <MenuItem label="Analytics" icon={<BarChartSquare3Icon />} />
      )}
    </NextLink>
  )
}
