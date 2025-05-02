import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Globe2Icon from '@core/shared/ui/icons/Globe2'

import { Item } from '../Item'

const TranslateJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TranslateJourneyDialog" */
      '../../../../JourneyList/JourneyCard/JourneyCardMenu/TranslateJourneyDialog'
    ).then((mod) => mod.TranslateJourneyDialog),
  { ssr: false }
)

/**
 * Props for the TranslateItem component
 *
 * @property {ComponentProps<typeof Item>['variant']} variant - The visual variant of the item ('menu-item' or 'button')
 * @property {() => void} [onClose] - Optional callback when the item's action is complete
 */
interface TranslateItemProps {
  variant: ComponentProps<typeof Item>['variant']
  onClose?: () => void
}

/**
 * TranslateItem component provides a UI element for initiating journey translation.
 *
 * This component renders either a button or menu item that, when clicked, opens a
 * TranslateJourneyDialog to allow users to translate the current journey to a different language.
 * It handles opening/closing the dialog and updating the route for HelpScout integration.
 *
 * @param {TranslateItemProps} props - The component props
 * @param {ComponentProps<typeof Item>['variant']} props.variant - The visual variant of the item
 * @param {() => void} [props.onClose] - Optional callback when the item's action is complete
 * @returns {ReactElement} The rendered component
 */
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
      {journey?.id != null && dialogOpen != null && (
        <TranslateJourneyDialog open={dialogOpen} onClose={handleClose} />
      )}
    </>
  )
}
