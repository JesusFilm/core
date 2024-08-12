import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import SettingsIcon from '@core/shared/ui/icons/Settings'

import { Item } from '../Item/Item'

const TemplateSettingsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "components/TemplateSettingsDialog" */
      './TemplateSettingsDialog'
    ).then((mod) => mod.TemplateSettingsDialog),
  { ssr: false }
)

interface TemplateSettingsItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

export function TemplateSettingsItem({
  variant,
  onClose
}: TemplateSettingsItemProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [templateSettingsDialogOpen, setTemplateSettingsDialogOpen] = useState<
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
    setRoute('templatesettings')
    setTemplateSettingsDialogOpen(true)
    onClose?.()
  }

  function handleClose(): void {
    setTemplateSettingsDialogOpen(false)
  }

  return (
    <>
      <Item
        variant={variant}
        label={t('Template Settings')}
        icon={<SettingsIcon />}
        onClick={handleClick}
      />
      {journey?.id != null && templateSettingsDialogOpen != null && (
        <TemplateSettingsDialog
          open={templateSettingsDialogOpen}
          onClose={handleClose}
        />
      )}
    </>
  )
}
