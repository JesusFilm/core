import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ComponentProps, ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
import { Item } from '../Item/Item'

const LanguageDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/Toolbar/Menu/LanguageDialog" */
      './LanguageDialog'
    ).then((mod) => mod.LanguageDialog)
)

interface LanguageMenuItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

export function LanguageItem({
  variant,
  onClose
}: LanguageMenuItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [showLanguageDialog, setShowLanguageDialog] = useState<
    boolean | undefined
  >()

  function setRoute(param: string): void {
    router.query.param = param
    void router.push(router, undefined, { shallow: true })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  const handleUpdateLanguage = (): void => {
    setRoute('languages')
    setShowLanguageDialog(true)
  }

  const handleClose = (): void => {
    setShowLanguageDialog(false)
    onClose?.()
  }

  return (
    <>
      <Item
        variant={variant}
        label={t('Language')}
        icon={<Globe1Icon />}
        onClick={handleUpdateLanguage}
      />
      {showLanguageDialog != null && (
        <LanguageDialog open={showLanguageDialog} onClose={handleClose} />
      )}
    </>
  )
}
