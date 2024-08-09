import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import File5Icon from '@core/shared/ui/icons/File5'

import { Item } from '../Item/Item'

const DescriptionDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "components/DescriptionDialog" */
      './DescriptionDialog'
    ).then((mod) => mod.DescriptionDialog),
  { ssr: false }
)

interface DescriptionItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

export function DescriptionItem({
  variant,
  onClose
}: DescriptionItemProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState<
    boolean | undefined
  >()

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleClick(): void {
    setRoute('description')
    setDescriptionDialogOpen(true)
    onClose?.()
  }

  function handleClose(): void {
    setDescriptionDialogOpen(false)
  }

  return (
    <>
      <Item
        variant={variant}
        label={t('Description')}
        icon={<File5Icon />}
        onClick={handleClick}
      />
      {journey?.id != null && descriptionDialogOpen != null && (
        <DescriptionDialog open={descriptionDialogOpen} onClose={handleClose} />
      )}
    </>
  )
}
