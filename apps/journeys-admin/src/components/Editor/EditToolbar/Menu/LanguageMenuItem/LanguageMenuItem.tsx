import TranslateIcon from '@mui/icons-material/Translate'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import { MenuItem } from '../../../../MenuItem'

const DynamicLanguageDialog = dynamic<{
  open: boolean
  onClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "MenuLanguageDialog" */
      './LanguageDialog'
    ).then((mod) => mod.LanguageDialog)
)

interface Props {
  isVisible?: boolean
  onClose?: () => void
}

export function LanguageMenuItem({ isVisible, onClose }: Props): ReactElement {
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)

  const handleUpdateLanguage = (): void => {
    setShowLanguageDialog(true)
  }

  const handleClose = (): void => {
    setShowLanguageDialog(false)
    onClose?.()
  }

  return (
    <>
      {isVisible === true && (
        <MenuItem
          label="Language"
          icon={<TranslateIcon />}
          onClick={handleUpdateLanguage}
        />
      )}
      {showLanguageDialog && (
        <DynamicLanguageDialog
          open={showLanguageDialog}
          onClose={handleClose}
        />
      )}
    </>
  )
}
