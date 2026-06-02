import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { alpha, darken } from '@mui/material/styles'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Play3Icon from '@core/shared/ui/icons/Play3'

interface JourneyViewCardActionsProps {
  /** Template id (admin deep link) and slug (public viewer route). */
  itemId: string
  itemSlug: string
  /**
   * Template title — used to disambiguate the Use/Preview controls on a page
   * with many cards (every card otherwise has identical "Use"/"Preview" labels,
   * which is impossible to navigate with voice control or a screen reader).
   */
  itemTitle: string
  /** Accent colour for the outlined Use button and the filled Preview button. */
  accent: string
  fullWidth?: boolean
  /** Light treatment for the Use button when it sits over a dark image. */
  onDark?: boolean
  /**
   * Render the buttons as non-interactive, `aria-hidden` look-alikes — used
   * by the read-only admin preview so the same card visual carries no real
   * links or focus targets.
   */
  decorative?: boolean
}

// Use and Preview share this height so the labelled button and the icon
// button line up exactly.
const ACTION_SIZE = 40

export function JourneyViewCardActions({
  itemId,
  itemSlug,
  itemTitle,
  accent,
  fullWidth = false,
  onDark = false,
  decorative = false
}: JourneyViewCardActionsProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  if (decorative) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" aria-hidden="true">
        <Box
          sx={{
            flex: fullWidth ? 1 : '0 0 auto',
            height: ACTION_SIZE,
            px: fullWidth ? 0 : 2.5,
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
        <Box
          sx={{
            width: ACTION_SIZE,
            height: ACTION_SIZE,
            flexShrink: 0,
            backgroundColor: accent,
            color: '#FFFFFF',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Play3Icon />
        </Box>
      </Stack>
    )
  }

  const adminUrl =
    process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? 'https://admin.nextstep.is'
  // Deep link into the admin "Use Template" receiver (NES-1608). Built via
  // `new URL` so a trailing slash on the env var doesn't double the path; the
  // URL searchParams handle encoding the template id.
  const useTemplateUrl = new URL('/', adminUrl)
  useTemplateUrl.searchParams.set('useTemplate', itemId)
  const useTemplateHref = useTemplateUrl.toString()
  // Public viewer route on the same root domain. Encode the slug as a free
  // defence: a slug containing `/`, `..`, or URL-encoded segment separators
  // would otherwise let the link navigate cross-origin or escape route scope.
  const previewHref = `/${encodeURIComponent(itemSlug)}`

  const useButtonSx = onDark
    ? {
        color: '#FFFFFF',
        borderColor: 'rgba(255,255,255,0.7)',
        '&:hover': {
          borderColor: '#FFFFFF',
          backgroundColor: 'rgba(255,255,255,0.12)'
        }
      }
    : {
        color: accent,
        borderColor: accent,
        '&:hover': {
          borderColor: accent,
          backgroundColor: alpha(accent, 0.06)
        }
      }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Button
        component="a"
        href={useTemplateHref}
        target="_blank"
        rel="noopener noreferrer"
        variant="outlined"
        fullWidth={fullWidth}
        aria-label={t('Use {{title}}', { title: itemTitle })}
        data-testid="GalleryTemplateCardUseButton"
        sx={{ height: ACTION_SIZE, ...useButtonSx }}
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
          width: ACTION_SIZE,
          height: ACTION_SIZE,
          flexShrink: 0,
          backgroundColor: accent,
          color: '#FFFFFF',
          borderRadius: 2,
          '&:hover': { backgroundColor: darken(accent, 0.15) }
        }}
      >
        <Play3Icon />
      </IconButton>
    </Stack>
  )
}
