import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ComponentProps, ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import File5Icon from '@core/shared/ui/icons/File5'

import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
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
  const [DescriptionDialogOpen, setDescriptionDialogOpen] = useState<
    boolean | undefined
  >()

  function setRoute(param: string): void {
    router.query.param = param
    void router.push(router, undefined, { shallow: true })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleClick(): void {
    setRoute('description')
    setDescriptionDialogOpen(true)
  }

  function handleClose(): void {
    setDescriptionDialogOpen(false)
    onClose?.()
  }

  return (
    <>
      <Item
        variant={variant}
        label={t('Description')}
        icon={<File5Icon />}
        onClick={handleClick}
      />
      {journey?.id != null && DescriptionDialogOpen != null && (
        <DescriptionDialog open={DescriptionDialogOpen} onClose={handleClose} />
      )}
    </>
  )
}
