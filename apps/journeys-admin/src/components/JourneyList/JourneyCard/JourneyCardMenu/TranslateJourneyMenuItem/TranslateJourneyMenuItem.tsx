import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'

import { MenuItem } from '../../../../MenuItem'

interface TranslateJourneyMenuItemProps {
  onClick: () => void
}

/**
 * TranslateJourneyMenuItem component provides a menu item for translating journeys.
 * When clicked, it triggers the provided onClick handler.
 *
 * @param {Object} props - Component props
 * @param {() => void} props.onClick - Function to handle click event
 * @returns {ReactElement} The rendered menu item component
 */
export function TranslateJourneyMenuItem({
  onClick
}: TranslateJourneyMenuItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <MenuItem
      label={t('Translate')}
      icon={<CopyLeftIcon color="secondary" />}
      onClick={onClick}
      data-testid="Translate"
    />
  )
}
