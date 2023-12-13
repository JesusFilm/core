import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

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
  const [showLanguageDialog, setShowLanguageDialog] = useState<
    boolean | undefined
  >()

  const handleUpdateLanguage = (): void => {
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
