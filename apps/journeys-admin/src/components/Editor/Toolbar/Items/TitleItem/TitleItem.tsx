import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { Item } from '../Item/Item'

const TitleDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "components/TitleDialog" */
      './TitleDialog'
    ).then((mod) => mod.TitleDialog),
  { ssr: false }
)

interface TitleItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

export function TitleItem({ variant, onClose }: TitleItemProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [titleDialogOpen, setTitleDialogOpen] = useState<boolean | undefined>()

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
    setTitleDialogOpen(true)
    onClose?.()
  }

  function handleClose(): void {
    setTitleDialogOpen(false)
  }

  return (
    <>
      <Item
        variant={variant}
        label={t('Title')}
        icon={<Edit2Icon />}
        onClick={handleClick}
      />
      {journey?.id != null && titleDialogOpen != null && (
        <TitleDialog open={titleDialogOpen} onClose={handleClose} />
      )}
    </>
  )
}
