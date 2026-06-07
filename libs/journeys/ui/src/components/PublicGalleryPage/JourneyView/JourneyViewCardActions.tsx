import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import {
  GALLERY_ACTION_SIZE,
  GALLERY_USE_BUTTON_MIN_WIDTH
} from '../galleryTokens'

interface JourneyViewCardActionsProps {
  /** Template id used in the admin "Use Template" deep link. */
  itemId: string
  /**
   * Template title — used to disambiguate the Use control on a page
   * with many cards (every card otherwise has an identical "Use" label,
   * which is impossible to navigate with voice control or a screen reader).
   */
  itemTitle: string
  /** Accent colour for the outlined Use button. */
  accent: string
  fullWidth?: boolean
  /**
   * Render the button as a non-interactive, `aria-hidden` look-alike — used
   * by the read-only admin preview so the same card visual carries no real
   * link or focus target.
   */
  decorative?: boolean
}

/**
 * Build the admin "Use Template" deep link, guarding against a schemeless
 * `NEXT_PUBLIC_JOURNEYS_ADMIN_URL` value (e.g. `admin.staging.local`) which
 * would otherwise throw inside `new URL` and crash the page at render.
 * In the fallback path we re-prepend `https://` so the resulting href is an
 * absolute URL — without the scheme, the browser resolves it as a relative
 * path against the current host (`https://gallery.host/admin.staging.local/...`)
 * instead of navigating to the admin app.
 */
function buildUseTemplateHref(adminUrl: string, itemId: string): string {
  try {
    const url = new URL('/', adminUrl)
    url.searchParams.set('useTemplate', itemId)
    return url.toString()
  } catch {
    // Trim whitespace before stripping `/` so a misconfigured env var with
    // padding still produces a parsable URL — `https://  admin.local  /...`
    // would be rejected by the browser; `https://admin.local/...` works.
    const sanitisedBase = adminUrl
      .trim()
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
    return `https://${sanitisedBase}/?useTemplate=${encodeURIComponent(itemId)}`
  }
}

export function JourneyViewCardActions({
  itemId,
  itemTitle,
  accent,
  fullWidth = false,
  decorative = false
}: JourneyViewCardActionsProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  if (decorative) {
    return (
      <Box
        aria-hidden="true"
        sx={{
          width: fullWidth ? '100%' : undefined,
          height: GALLERY_ACTION_SIZE,
          px: fullWidth ? 0 : 2.5,
          // Match the live (non-decorative) button's `minWidth` so the
          // admin preview's Use look-alike carries the same visual
          // weight as what the publisher will see.
          minWidth: fullWidth ? undefined : GALLERY_USE_BUTTON_MIN_WIDTH,
          borderRadius: 1,
          border: `1px solid ${accent}`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}
      >
        {t('Use')}
      </Box>
    )
  }

  // `||` (not `??`) so an explicitly-empty `NEXT_PUBLIC_JOURNEYS_ADMIN_URL`
  // (a common misconfiguration when an env var is set but blank) still
  // falls back to the default instead of producing a malformed
  // `https:///?useTemplate=...` href.
  const adminUrl =
    process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL || 'https://admin.nextstep.is'
  // Deep link into the admin "Use Template" receiver (NES-1608). Prefer the
  // `new URL` form so a trailing slash on the env var doesn't double the path
  // and the URL searchParams handle encoding the template id. Fall back to a
  // sanitised template string if the env var is ever a schemeless value
  // (e.g. `admin.staging.local`) — `new URL` would throw and crash render.
  const useTemplateHref = buildUseTemplateHref(adminUrl, itemId)

  return (
    <Button
      component="a"
      href={useTemplateHref}
      target="_blank"
      rel="noopener noreferrer"
      variant="outlined"
      fullWidth={fullWidth}
      aria-label={t('Use {{title}}', { title: itemTitle })}
      data-testid="GalleryTemplateCardUseButton"
      sx={{
        height: GALLERY_ACTION_SIZE,
        // In the Explore section the button is non-fullWidth (it sits in a
        // text column); give it a roomier minWidth so the label has weight
        // matching the surrounding type. In More cards `fullWidth` stretches
        // it to fill the column.
        minWidth: fullWidth ? undefined : GALLERY_USE_BUTTON_MIN_WIDTH,
        color: accent,
        borderColor: accent,
        '&:hover': {
          borderColor: accent,
          backgroundColor: alpha(accent, 0.06)
        }
      }}
    >
      {t('Use')}
    </Button>
  )
}
