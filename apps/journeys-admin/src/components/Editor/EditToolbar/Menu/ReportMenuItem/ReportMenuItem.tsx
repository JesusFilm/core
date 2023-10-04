import NextLink from 'next/link'
import { ReactElement } from 'react'

import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

import { JourneyFields as Journey } from '../../../../../../__generated__/JourneyFields'
import { MenuItem } from '../../../../MenuItem/MenuItem'

interface Props {
  journey: Journey
}

export function ReportMenuItem({ journey }: Props): ReactElement {
  return (
    <NextLink href={`/journeys/${journey.id}/reports`} passHref legacyBehavior>
      <MenuItem label="Report" icon={<BarChartSquare3Icon />} />
    </NextLink>
  )
}
