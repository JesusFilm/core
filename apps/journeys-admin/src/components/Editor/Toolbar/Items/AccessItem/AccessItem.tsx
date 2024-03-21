import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
import { Item } from '../Item/Item'

const AccessDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "components/AccessDialog" */
      '../../../../AccessDialog'
    ).then((mod) => mod.AccessDialog),
  { ssr: false }
)

interface AccessItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

export function AccessItem({
  variant,
  onClose
}: AccessItemProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [accessDialogOpen, setAccessDialogOpen] = useState<
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
    setRoute('access')
    setAccessDialogOpen(true)
  }

  function handleClose(): void {
    setAccessDialogOpen(false)
    onClose?.()
  }

  return (
    <>
      <Item
        variant={variant}
        label={t('Manage Access')}
        icon={<UsersProfiles2Icon />}
        onClick={handleClick}
      />
      {journey?.id != null && accessDialogOpen != null && (
        <AccessDialog
          journeyId={journey.id}
          open={accessDialogOpen}
          onClose={handleClose}
        />
      )}
    </>
  )
}
