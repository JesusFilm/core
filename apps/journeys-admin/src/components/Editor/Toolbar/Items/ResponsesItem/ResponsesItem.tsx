import Box from '@mui/material/Box'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Inbox2Icon from '@core/shared/ui/icons/Inbox2'

import { Item } from '../Item/Item'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

interface ResponsesItemProps {
  variant: ComponentProps<typeof Item>['variant']
}

export function ResponsesItem({ variant }: ResponsesItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  return (
    <Box data-testid="ResponsesItem">
      <NextLink
        href={`/journeys/${journey?.id}/reports/visitors`}
        passHref
        legacyBehavior
        prefetch={false}
      >
        <Stack direction="row" alignItems="center">
          <Item
            variant={variant}
            label={t('Analytics')}
            icon={<Inbox2Icon />}
          />
          <Typography variant="body2" sx={{ fontWeight: '600' }}>
            14 {/* TODO: Add actual count */}
          </Typography>
        </Stack>
      </NextLink>
    </Box>
  )
}
