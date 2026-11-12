import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../../__generated__/GetCampaign'
import {
  CampaignFocalPointPicker,
  FocalPoint
} from '../CampaignFocalPointPicker'
import { CommandError } from '../CommandError'
import { SliderRow } from '../SliderRow'
import { useCampaignBlockFieldsCommand } from '../utils/useCampaignBlockFieldsCommand'

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
  const { addFields, error } = useCampaignBlockFieldsCommand()

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
    addFields(image, point)
  }

  function handleZoomCommit(percent: number): void {
    const nextScale = percent === IMAGE_SCALE_MIN ? null : percent
    if (nextScale === (image.scale ?? null)) return
    addFields(image, { scale: nextScale })
  }

  return (
    <Stack spacing={2} data-testid="FocalPointControl" data-block-id={image.id}>
      <CommandError error={error} />
      <CampaignFocalPointPicker
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        value={value}
        onChange={handleChange}
      />
      <Stack spacing={1}>
        <SliderRow
          key={image.id}
          id={`focal-zoom-${image.id}`}
          label={t('Zoom')}
          value={image.scale ?? IMAGE_SCALE_MIN}
          min={IMAGE_SCALE_MIN}
          max={IMAGE_SCALE_MAX}
          step={IMAGE_SCALE_STEP}
          format={zoomLabel}
          helperText={t(
            'Magnifies the picture around the focal point wherever it fills a frame.'
          )}
          valueTestId="FocalPointZoomValue"
          onCommit={handleZoomCommit}
        />
      </Stack>
    </Stack>
  )
}
