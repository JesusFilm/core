import Alert from '@mui/material/Alert'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

interface FirstRunHintProps {
  campaignId: string
}

/** The `localStorage` flag that records the hint was dismissed for a campaign. */
export function firstRunHintKey(campaignId: string): string {
  return `campaignEditorFirstRunHint:${campaignId}`
}

/**
 * The one first-run hint floating over the canvas in the Canvas banner after create, once per
 * campaign: dismissing it sets the flag like the editor's other one-time
 * tours. No wizard, no modal.
 */
export function FirstRunHint({
  campaignId
}: FirstRunHintProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  // Starts hidden so the server and the first client render agree.
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    setDismissed(localStorage.getItem(firstRunHintKey(campaignId)) === 'true')
  }, [campaignId])

  function handleDismiss(): void {
    localStorage.setItem(firstRunHintKey(campaignId), 'true')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <Alert
      severity="info"
      onClose={handleDismiss}
      data-testid="CampaignFirstRunHint"
      sx={{ boxShadow: 4 }}
    >
      {t(
        'Pick anything on the page or in the Navigator, then change it in the Inspector.'
      )}
    </Alert>
  )
}
