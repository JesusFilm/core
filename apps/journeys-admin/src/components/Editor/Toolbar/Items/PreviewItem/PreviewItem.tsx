import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Play3Icon from '@core/shared/ui/icons/Play3'

import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'
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

  const journeyPath = `/api/preview?slug=${journey?.slug}`
  const customDomainParam = hostname != null ? `&hostname=${hostname}` : ''
  const href =
    journey?.slug != null ? journeyPath + customDomainParam : undefined

  return (
    <Box data-testid="PreviewItem">
      <Item
        variant={variant}
        href={href}
        label={t('Preview')}
        icon={<Play3Icon />}
        onClick={onClick}
        ButtonProps={{
          disabled: href == null
        }}
      />
    </Box>
  )
}
