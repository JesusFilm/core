import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import { MenuItem } from '../../../../MenuItem'

interface TranslateJourneyMenuItemProps {
  id?: string
  handleCloseMenu: () => void
}

/**
 * TranslateJourneyMenuItem component provides a menu item for translating journeys.
 * When clicked, it opens the translation dialog.
 *
 * @param {Object} props - Component props
 * @param {string} props.id - The unique identifier for the journey
 * @param {() => void} props.handleCloseMenu - Function to close the menu after action is complete
 * @returns {ReactElement} The rendered menu item component
 */
export function TranslateJourneyMenuItem({
  id,
  handleCloseMenu
}: TranslateJourneyMenuItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [openTranslateDialog, setOpenTranslateDialog] = useState(false)

  return (
    <>
      <MenuItem
        label={t('Translate')}
        icon={<CopyLeftIcon color="secondary" />}
        onClick={() => {
          setOpenTranslateDialog(true)
          handleCloseMenu()
        }}
        data-testid="Translate"
      />
      {/* TODO: Translate journey dialog */}
    </>
  )
}
