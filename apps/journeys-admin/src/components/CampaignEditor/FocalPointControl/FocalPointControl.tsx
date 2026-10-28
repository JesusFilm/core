import Alert from '@mui/material/Alert'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../../__generated__/GetCampaign'
import {
  CampaignImageMediaInput,
  useCampaignImageBlockUpdateMutation
} from '../../../libs/useCampaignImageBlockUpdateMutation'
import { useCampaignStyleCommand } from '../utils/useCampaignStyleCommand'

import { FocalPoint, FocalPointPicker } from './FocalPointPicker'

/** The zoom slider runs from none to double, in steps of ten percent. */
export const IMAGE_SCALE_MIN = 100
export const IMAGE_SCALE_MAX = 200
export const IMAGE_SCALE_STEP = 10

/** The zoom as the author reads it: `1.5×`. */
export function zoomLabel(scale: number): string {
  return `${(scale / 100).toFixed(1)}×`
}

interface FocalPointControlProps {
  /** The image whose focal point is set; nothing renders without a picture. */
  image: CampaignImageBlock
}

/**
 * The focal point of an owned or section image: the picker over the picture,
 * each click or drag one Command through `campaignImageBlockUpdate` so the
 * crop follows on the canvas at once and undo puts the point back; under it
 * a Zoom slider from none to double that magnifies the picture around that
 * point wherever it fills a frame, written the same way when released.
 */
export function FocalPointControl({
  image
}: FocalPointControlProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { addStyle, error } = useCampaignStyleCommand()
  const writeMedia = useCampaignImageBlockUpdateMutation()
  const scale = image.scale ?? IMAGE_SCALE_MIN
  const [zoom, setZoom] = useState(scale)

  useEffect(() => {
    setZoom(scale)
  }, [image.id, scale])

  if (image.src == null) return null

  const value: FocalPoint = {
    focalLeft: image.focalLeft ?? 50,
    focalTop: image.focalTop ?? 50
  }

  function handleChange(point: FocalPoint): void {
    if (
      point.focalLeft === value.focalLeft &&
      point.focalTop === value.focalTop
    )
      return
    addStyle<CampaignImageBlock, CampaignImageMediaInput>({
      block: image,
      input: point,
      previous: value,
      run: writeMedia
    })
  }

  function handleZoomCommit(_event: unknown, next: number | number[]): void {
    const percent = Array.isArray(next) ? next[0] : next
    const nextScale = percent === IMAGE_SCALE_MIN ? null : percent
    if (nextScale === (image.scale ?? null)) return
    addStyle<CampaignImageBlock, CampaignImageMediaInput>({
      block: image,
      input: { scale: nextScale },
      previous: { scale: image.scale ?? null },
      run: writeMedia
    })
  }

  return (
    <Stack spacing={2} data-testid="FocalPointControl" data-block-id={image.id}>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <FocalPointPicker
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        value={value}
        onChange={handleChange}
      />
      <Stack spacing={1}>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" id={`focal-zoom-${image.id}`}>
            {t('Zoom')}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid="FocalPointZoomValue"
          >
            {zoomLabel(zoom)}
          </Typography>
        </Stack>
        <Slider
          aria-labelledby={`focal-zoom-${image.id}`}
          value={zoom}
          min={IMAGE_SCALE_MIN}
          max={IMAGE_SCALE_MAX}
          step={IMAGE_SCALE_STEP}
          valueLabelDisplay="auto"
          valueLabelFormat={zoomLabel}
          onChange={(_event, next) =>
            setZoom(Array.isArray(next) ? next[0] : next)
          }
          onChangeCommitted={handleZoomCommit}
          sx={{ mx: 1, width: 'auto' }}
        />
        <Typography variant="caption" color="text.secondary">
          {t(
            'Magnifies the picture around the focal point wherever it fills a frame.'
          )}
        </Typography>
      </Stack>
    </Stack>
  )
}
