import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Globe2Icon from '@core/shared/ui/icons/Globe2'

import { Item } from '../Item'

interface TranslateItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

export function TranslateItem({
  variant,
  onClose
}: TranslateItemProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [dialogOpen, setDialogOpen] = useState<boolean | null>(null)

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleClick(): void {
    setRoute('journeyTranslate')
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
        label={t('Translate')}
        icon={<Globe2Icon />}
        onClick={handleClick}
      />
      {/* TranslateJourneyDialog will be added here in a later step */}
    </>
  )
}
