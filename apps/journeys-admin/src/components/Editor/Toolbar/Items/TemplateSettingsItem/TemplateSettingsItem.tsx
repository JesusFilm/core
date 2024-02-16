import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ComponentProps, ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import SettingsIcon from '@core/shared/ui/icons/Settings'

import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
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
  const [TemplateSettingsDialogOpen, setTemplateSettingsDialogOpen] = useState<
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
    setRoute('templatesettings')
    setTemplateSettingsDialogOpen(true)
  }

  function handleClose(): void {
    setTemplateSettingsDialogOpen(false)
    onClose?.()
  }

  return (
    <>
      <Item
        variant={variant}
        label={t('Template Settings')}
        icon={<SettingsIcon />}
        onClick={handleClick}
      />
      {journey?.id != null && TemplateSettingsDialogOpen != null && (
        <TemplateSettingsDialog
          open={TemplateSettingsDialogOpen}
          onClose={handleClose}
        />
      )}
    </>
  )
}
