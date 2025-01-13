import Box from '@mui/material/Box'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

import { Item } from '../../../Item'

export function ScanCount(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Box data-testid="ScanCount">
      <NextLink href="" passHref legacyBehavior prefetch={false}>
        <Item
          variant="icon-button"
          label={t('Scan count')}
          icon={<BarChartSquare3Icon />}
          count={0}
          countLabel={t('{{count}} scans', {
            count: 0
          })}
          showCountLabel
        />
      </NextLink>
    </Box>
  )
}
