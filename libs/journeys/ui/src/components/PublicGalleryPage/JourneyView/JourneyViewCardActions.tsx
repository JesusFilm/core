import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Play3Icon from '@core/shared/ui/icons/Play3'

import {
  buildCustomizeHref,
  buildUseTemplateHref
} from '../../../libs/adminTemplateLinks'
import {
  GALLERY_ACTION_COLOR,
  GALLERY_ACTION_SIZE,
  GALLERY_USE_BUTTON_MIN_WIDTH
} from '../galleryTokens'

interface JourneyViewCardActionsProps {
  /** Template id used in the admin "Use Template" deep link. */
  itemId: string
  /** When true, link into the customize flow instead of the copy-to-team deep link. */
  customizable?: boolean | null
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
  /**
   * Width behaviour of the Use button within the action row:
   * - `true` — always fill the row (the More grid cards).
   * - `'responsive'` — fill when stacked (mobile), fixed width when
   *   side-by-side (desktop). The breakpoint matches FeaturedRow's
   *   column→row switch at `md`, so the Use button goes full-width exactly
   *   when the two Explore rows stack on top of each other.
   * - `false` (default) — always fixed width.
   *
   * The read-only admin preview is always stacked-narrow, so both `true` and
   * `'responsive'` fill there. We deliberately avoid viewport `sx`
   * breakpoints for the preview — they key off the browser viewport, not the
   * ~287px preview pane, and would resolve to the desktop form.
   */
  fullWidth?: boolean | 'responsive'
  /**
   * Render the buttons as non-interactive, `aria-hidden` look-alikes — used
   * by the read-only admin preview so the same card visual carries no real
   * link or focus target.
   */
  decorative?: boolean
}

function buildUseHref(
  adminUrl: string,
  itemId: string,
  customizable?: boolean | null
): string {
  if (customizable === true) {
    return buildCustomizeHref(adminUrl, itemId)
  }
  return buildUseTemplateHref(adminUrl, itemId)
}

export function JourneyViewCardActions({
  itemId,
  customizable,
  itemTitle,
  itemSlug,
  fullWidth = false,
  decorative = false
}: JourneyViewCardActionsProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const alwaysFull = fullWidth === true
  const responsiveFull = fullWidth === 'responsive'

  // The Preview button is a fixed square that sits beside the Use button.
  // `flexShrink: 0` keeps it at full size when the Use button stretches
  // (filled rows) — without it the icon button is the item that gets
  // squeezed, which is exactly the regression this restores.
  const previewSquareSx = {
    flexShrink: 0,
    width: GALLERY_ACTION_SIZE,
    height: GALLERY_ACTION_SIZE,
    borderRadius: 1,
    backgroundColor: GALLERY_ACTION_COLOR,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as const

  if (decorative) {
    // The preview pane is always stacked, so anything that fills on mobile
    // fills here too (no viewport breakpoints — see the prop doc).
    const fill = alwaysFull || responsiveFull
    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        aria-hidden="true"
        sx={{ width: fill ? '100%' : undefined }}
      >
        <Box
          sx={{
            // The Use look-alike fills the row when stacked and keeps a roomy
            // minWidth otherwise so it carries the same visual weight as the
            // live button the publisher will see.
            flex: fill ? 1 : undefined,
            height: GALLERY_ACTION_SIZE,
            px: 2.5,
            minWidth: fill ? undefined : GALLERY_USE_BUTTON_MIN_WIDTH,
            borderRadius: 1,
            border: `1px solid ${GALLERY_ACTION_COLOR}`,
            color: GALLERY_ACTION_COLOR,
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
  const useTemplateHref = buildUseHref(adminUrl, itemId, customizable)
  // Public viewer route on the same root domain; the journeys middleware
  // rewrites `/<slug>` → `/home/<slug>`.
  const previewHref = `/${itemSlug}`

  // `responsive`: fill on mobile (stacked), fixed on desktop (md+, where the
  // Explore row goes side-by-side). `flexGrow` lets the Use button take the
  // row's free space when filling; `0` + a minWidth pins it otherwise.
  const useFlexGrow = alwaysFull ? 1 : responsiveFull ? { xs: 1, md: 0 } : 0
  const useMinWidth = alwaysFull
    ? undefined
    : responsiveFull
      ? { xs: undefined, md: GALLERY_USE_BUTTON_MIN_WIDTH }
      : GALLERY_USE_BUTTON_MIN_WIDTH
  const rowWidth = alwaysFull
    ? '100%'
    : responsiveFull
      ? { xs: '100%', md: 'auto' }
      : undefined

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ width: rowWidth }}
    >
      <Button
        component="a"
        href={useTemplateHref}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        aria-label={t('Use {{title}}', { title: itemTitle })}
        data-testid="GalleryTemplateCardUseButton"
        sx={{
          height: GALLERY_ACTION_SIZE,
          flexGrow: useFlexGrow,
          minWidth: useMinWidth,
          color: GALLERY_ACTION_COLOR,
          borderColor: GALLERY_ACTION_COLOR,
          '&:hover': {
            borderColor: GALLERY_ACTION_COLOR,
            backgroundColor: alpha(GALLERY_ACTION_COLOR, 0.06)
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
