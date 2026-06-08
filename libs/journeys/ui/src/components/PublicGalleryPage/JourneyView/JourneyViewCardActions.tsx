import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Play3Icon from '@core/shared/ui/icons/Play3'

import {
  GALLERY_ACTION_SIZE,
  GALLERY_PREVIEW_BG,
  GALLERY_USE_BUTTON_MIN_WIDTH
} from '../galleryTokens'

interface JourneyViewCardActionsProps {
  /** Template id used in the admin "Use Template" deep link. */
  itemId: string
  /**
   * Template title — used to disambiguate the Use/Preview controls on a page
   * with many cards (every card otherwise has an identical "Use"/"Preview"
   * label, which is impossible to navigate with voice control or a screen
   * reader).
   */
  itemTitle: string
  /**
   * Template slug — builds the public viewer link the Preview button opens
   * (`/<slug>`, which the journeys middleware rewrites to `/home/<slug>`).
   */
  itemSlug: string
  /** Accent colour for the outlined Use button and the filled Preview button. */
  accent: string
  fullWidth?: boolean
  /**
   * Render the buttons as non-interactive, `aria-hidden` look-alikes — used
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
  itemSlug,
  accent,
  fullWidth = false,
  decorative = false
}: JourneyViewCardActionsProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  // The Preview button is a fixed square that sits beside the Use button.
  // `flexShrink: 0` keeps it at full size when the Use button stretches
  // (`fullWidth` More cards) — without it the icon button is the item that
  // gets squeezed, which is exactly the regression this restores.
  const previewSquareSx = {
    flexShrink: 0,
    width: GALLERY_ACTION_SIZE,
    height: GALLERY_ACTION_SIZE,
    borderRadius: 1,
    backgroundColor: GALLERY_PREVIEW_BG,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as const

  if (decorative) {
    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        aria-hidden="true"
        sx={{ width: fullWidth ? '100%' : undefined }}
      >
        <Box
          sx={{
            // The Use look-alike fills the row in `fullWidth` More cards and
            // keeps a roomy minWidth in the Explore section so it carries the
            // same visual weight as the live button the publisher will see.
            flex: fullWidth ? 1 : undefined,
            height: GALLERY_ACTION_SIZE,
            px: 2.5,
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
        <Box sx={previewSquareSx}>
          <Play3Icon />
        </Box>
      </Stack>
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
  // Public viewer route on the same root domain; the journeys middleware
  // rewrites `/<slug>` → `/home/<slug>`.
  const previewHref = `/${itemSlug}`

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ width: fullWidth ? '100%' : undefined }}
    >
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
      <IconButton
        component="a"
        href={previewHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('Preview {{title}}', { title: itemTitle })}
        data-testid="GalleryTemplateCardPreviewButton"
        sx={{
          ...previewSquareSx,
          '&:hover': {
            backgroundColor: '#000000'
          }
        }}
      >
        <Play3Icon />
      </IconButton>
    </Stack>
  )
}
