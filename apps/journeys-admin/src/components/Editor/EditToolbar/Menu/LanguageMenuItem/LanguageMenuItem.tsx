import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, useState } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { setBeaconPageViewed } from '../../../../../libs/setBeaconPageViewed'
import { MenuItem } from '../../../../MenuItem'

const LanguageDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditToolbar/Menu/LanguageDialog" */
      './LanguageDialog'
    ).then((mod) => mod.LanguageDialog)
)

interface LanguageMenuItemProps {
  onClose?: () => void
}

export function LanguageMenuItem({
  onClose
}: LanguageMenuItemProps): ReactElement {
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
      <MenuItem
        label="Language"
        icon={<Globe1Icon />}
        onClick={handleUpdateLanguage}
        testId="Language"
      />
      {showLanguageDialog != null && (
        <LanguageDialog open={showLanguageDialog} onClose={handleClose} />
      )}
    </>
  )
}
