import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import type { ReactElement, ReactNode } from 'react'

import BarGroup3Icon from '@core/shared/ui/icons/BarGroup3'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

interface ReportsNavigationProps {
  destination: 'journey' | 'visitor'
  journeyId?: string
}

export function ReportsNavigation({
  destination,
  journeyId
}: ReportsNavigationProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  let href: string
  let icon: ReactNode
  if (destination === 'journey') {
    icon = <BarGroup3Icon />
    href =
      journeyId !== undefined
        ? `/journeys/${journeyId}/reports`
        : '/reports/journeys'
  } else {
    icon = <UsersProfiles2Icon />
    href =
      journeyId !== undefined
        ? `/journeys/${journeyId}/reports/visitors`
        : '/reports/visitors'
  }
  const label = destination === 'journey' ? t('Journeys') : t('Visitors')

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      flexGrow={1}
      data-testid="JourneysAdminReportsNavigation"
    >
      <Chip
        icon={icon}
        label={label}
        component={NextLink}
        href={href}
        variant="outlined"
        clickable
        sx={{
          display: {
            xs: 'none',
            md: 'flex'
          }
        }}
      />
      <IconButton
        component={NextLink}
        href={href}
        aria-label={label}
        sx={{
          display: {
            xs: 'flex',
            md: 'none'
          }
        }}
      >
        {icon}
      </IconButton>
    </Stack>
  )
}
