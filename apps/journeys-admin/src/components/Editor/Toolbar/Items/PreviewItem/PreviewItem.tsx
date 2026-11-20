import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
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
  const href =
    journey?.id != null
      ? `/journeys/${encodeURIComponent(journey.id)}/preview`
      : undefined

  return (
    <Box data-testid="PreviewItem">
      <Item
        variant={variant}
        href={href}
        label={t('Preview')}
        icon={<Play3Icon />}
        onClick={onClick}
        ButtonProps={{
          disabled: href == null,
          sx: { ml: 3 }
        }}
      />
    </Box>
  )
}
