import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import {
  CAMPAIGN_PICTURE_RATIOS,
  campaignImageSource,
  focalImageSx
} from '@core/journeys/ui/Campaign'

import type { CanvasBlock } from '../canvasBlock'
import { EditorNote } from '../EditorNote'

interface CanvasPictureProps {
  /** The Image section. */
  block: CanvasBlock
}

/** An Image section's picture, cropped to its focal point; a placeholder pointing at Edit while it has none. */
export function CanvasPicture({ block }: CanvasPictureProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const picture =
    block.__typename === 'CampaignImageBlock'
      ? campaignImageSource(block)
      : null

  if (picture == null)
    return (
      <Box
        data-testid="CanvasSectionImagePlaceholder"
        sx={{
          width: '100%',
          aspectRatio: '16 / 6',
          border: '1px dashed var(--campaign-band-border)',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--campaign-band-muted)'
        }}
      >
        <EditorNote>{t('Add a picture from Edit')}</EditorNote>
      </Box>
    )

  return (
    <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: 1 }}>
      <Box
        component="img"
        src={picture.src}
        alt={picture.alt ?? ''}
        data-testid="CanvasSectionImage"
        sx={{
          display: 'block',
          width: '100%',
          height: 'auto',
          aspectRatio: CAMPAIGN_PICTURE_RATIOS.wide,
          objectFit: 'cover',
          ...focalImageSx(picture)
        }}
      />
    </Box>
  )
}
