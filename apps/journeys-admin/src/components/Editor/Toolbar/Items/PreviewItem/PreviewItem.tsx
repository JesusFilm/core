import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useCustomDomainsQuery } from '@core/journeys/ui/useCustomDomainsQuery'
import Play3Icon from '@core/shared/ui/icons/Play3'

import { Item } from '../Item/Item'

interface PreviewItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClick?: () => void
}

export function PreviewItem({
  variant,
  onClick
}: PreviewItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: journey?.team?.id ?? '' },
    skip: journey?.team?.id == null
  })

  return (
    <Box data-testid="PreviewItem">
      <Item
        variant={variant}
        href={`/api/preview?slug=${journey?.slug}${
          hostname != null ? `&hostname=${hostname}` : ''
        }`}
        label={t('Preview')}
        icon={<Play3Icon />}
        onClick={onClick}
      />
    </Box>
  )
}
