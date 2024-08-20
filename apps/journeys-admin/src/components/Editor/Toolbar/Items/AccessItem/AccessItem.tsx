import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import UsersProfiles2Icon from '@core/shared/ui/icons/UsersProfiles2'

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
  const [accessDialogOpen, setAccessDialogOpen] = useState<boolean | undefined>(
    router?.query?.manageAccess === 'true' ? true : undefined
  )

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleClick(): void {
    setRoute('access')
    setAccessDialogOpen(true)
    onClose?.()
  }

  function handleClose(): void {
    setAccessDialogOpen(false)
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
