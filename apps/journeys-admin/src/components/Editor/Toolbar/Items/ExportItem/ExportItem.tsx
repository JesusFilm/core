import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ShareIcon from '@core/shared/ui/icons/Share'

import { Item } from '../Item/Item'

const ExportDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "components/ExportDialog" */
      './ExportDialog'
    ).then((mod) => mod.ExportDialog),
  { ssr: false }
)

interface ExportItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

export function ExportItem({
  variant,
  onClose
}: ExportItemProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [titleDialogOpen, setExportDialogOpen] = useState<boolean | undefined>()

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleClick(): void {
    setRoute('title')
    setExportDialogOpen(true)
    onClose?.()
  }

  function handleClose(): void {
    setExportDialogOpen(false)
  }

  return (
    <>
      <Item
        variant={variant}
        label={t('Export / Import')}
        icon={<ShareIcon />}
        onClick={handleClick}
      />
      {journey?.id != null && titleDialogOpen != null && (
        <ExportDialog open={titleDialogOpen} onClose={handleClose} />
      )}
    </>
  )
}
