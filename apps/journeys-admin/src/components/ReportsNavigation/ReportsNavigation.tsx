import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import type { ReactElement } from 'react'

import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

interface ReportsNavigationProps {
  journeyId?: string
}

export function ReportsNavigation({
  journeyId
}: ReportsNavigationProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      flexGrow={1}
      sx={{
        mr: { md: 8 } // helpscout beacon
      }}
    >
      <NextLink
        href={
          journeyId !== undefined
            ? `/journeys/${journeyId}/reports/visitors`
            : '/reports/visitors'
        }
        passHref
        legacyBehavior
      >
        <Chip
          icon={<UsersProfiles2Icon />}
          label={t('Visitors')}
          component="a"
          variant="outlined"
          clickable
          sx={{
            display: {
              xs: 'none',
              md: 'flex'
            }
          }}
        />
      </NextLink>
      <NextLink
        href={
          journeyId !== undefined
            ? `/journeys/${journeyId}/reports/visitors`
            : '/reports/visitors'
        }
        passHref
        legacyBehavior
      >
        <IconButton
          aria-label="Visitors"
          href={
            journeyId !== undefined
              ? `/journeys/${journeyId}/reports/visitors`
              : '/reports/visitors'
          }
          target="_blank"
          sx={{
            display: {
              xs: 'flex',
              md: 'none'
            }
          }}
        >
          <UsersProfiles2Icon />
        </IconButton>
      </NextLink>
    </Stack>
  )
}
