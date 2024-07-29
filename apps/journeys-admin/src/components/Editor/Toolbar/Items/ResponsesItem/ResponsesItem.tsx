import Inbox2 from '@core/shared/ui/icons/Inbox2'
import { useTranslation } from 'next-i18next'
import NextLink from 'next/link'
import { ComponentProps } from 'react'
import { Item } from '../Item'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Box from '@mui/material/Box'

interface ResponsesItemProps {
  variant: ComponentProps<typeof Item>['variant']
}

export function ResponsesItem({ variant }: ResponsesItemProps) {
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
        <Item
          variant={variant}
          label={25}
          icon={<Inbox2 />}
          ButtonProps={{
            variant: 'text'
          }}
        />
      </NextLink>
    </Box>
  )
}
