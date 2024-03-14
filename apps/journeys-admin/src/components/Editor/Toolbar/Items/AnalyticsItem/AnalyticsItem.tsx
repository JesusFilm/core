import NextLink from 'next/link'
import { ComponentProps, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

import { Item } from '../Item/Item'

interface AnalyticsItemProps {
  variant: ComponentProps<typeof Item>['variant']
}

export function AnalyticsItem({ variant }: AnalyticsItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  return (
    <NextLink
      href={`/journeys/${journey?.id}/reports`}
      passHref
      legacyBehavior
      prefetch={false}
    >
      <Item
        variant={variant}
        label={t('Analytics')}
        icon={<BarChartSquare3Icon />}
      />
    </NextLink>
  )
}
