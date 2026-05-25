import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { alpha, darken } from '@mui/material/styles'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Play3Icon from '@core/shared/ui/icons/Play3'

import { GetTemplateGalleryPage_templateGalleryPageBySlug_templates as GalleryTemplate } from '../../../../__generated__/GetTemplateGalleryPage'

interface GalleryCardActionsProps {
  template: Pick<GalleryTemplate, 'id' | 'slug'>
  /** Accent colour for the outlined Use button and the filled Preview button. */
  accent: string
  fullWidth?: boolean
  /** Light treatment for the Use button when it sits over a dark image. */
  onDark?: boolean
}

// Use and Preview share this height so the labelled button and the icon
// button line up exactly.
const ACTION_SIZE = 40

export function GalleryCardActions({
  template,
  accent,
  fullWidth = false,
  onDark = false
}: GalleryCardActionsProps): ReactElement {
  const { t } = useTranslation('apps-journeys')

  const adminUrl =
    process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL ?? 'https://admin.nextstep.is'
  // Deep link into the admin "Use Template" receiver (NES-1608).
  const useTemplateHref = `${adminUrl}/?useTemplate=${encodeURIComponent(template.id)}`
  // Public viewer route on the same root domain.
  const previewHref = `/${template.slug}`

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
        aria-label={t('Preview')}
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
