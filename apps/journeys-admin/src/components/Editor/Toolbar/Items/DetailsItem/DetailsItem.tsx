import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { JourneyDetailsDialog } from '../../JourneyDetailsDialog'
import { Item } from '../Item/Item'

interface DetailsItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

export function DetailsItem({
  variant,
  onClose
}: DetailsItemProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [dialogOpen, setDialogOpen] = useState(false)

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleClick(): void {
    setRoute('journeyDetails')
    setDialogOpen(true)
    onClose?.()
  }

  function handleClose(): void {
    setDialogOpen(false)
  }

  return (
    <>
      <Item
        variant={variant}
        label={t('Edit Details')}
        icon={<Edit2Icon />}
        onClick={handleClick}
      />
      {journey?.id != null && dialogOpen != null && (
        <JourneyDetailsDialog open={dialogOpen} onClose={handleClose} />
      )}
    </>
  )
}
