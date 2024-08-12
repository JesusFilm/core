import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import Globe1Icon from '@core/shared/ui/icons/Globe1'

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
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  const handleUpdateLanguage = (): void => {
    setRoute('languages')
    setShowLanguageDialog(true)
    onClose?.()
  }

  const handleClose = (): void => {
    setShowLanguageDialog(false)
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
