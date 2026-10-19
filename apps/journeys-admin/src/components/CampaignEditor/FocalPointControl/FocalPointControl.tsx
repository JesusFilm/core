import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../../__generated__/GetCampaign'
import {
  CampaignImageMediaInput,
  useCampaignImageBlockUpdateMutation
} from '../../../libs/useCampaignImageBlockUpdateMutation'
import { useCampaignStyleCommand } from '../utils/useCampaignStyleCommand'

import { FocalPoint, FocalPointPicker } from './FocalPointPicker'

interface FocalPointControlProps {
  /** The image whose focal point is set; nothing renders without a picture. */
  image: CampaignImageBlock
}

/**
 * The focal point of an owned or section image: the picker over the picture,
 * each click or drag one Command through `campaignImageBlockUpdate` so the
 * crop follows on the canvas at once and undo puts the point back.
 */
export function FocalPointControl({
  image
}: FocalPointControlProps): ReactElement | null {
  const { addStyle, error } = useCampaignStyleCommand()
  const writeMedia = useCampaignImageBlockUpdateMutation()

  if (image.src == null) return null

  const value: FocalPoint = {
    focalLeft: image.focalLeft ?? 50,
    focalTop: image.focalTop ?? 50
  }

  function handleChange(point: FocalPoint): void {
    if (point.focalLeft === value.focalLeft && point.focalTop === value.focalTop)
      return
    addStyle<CampaignImageBlock, CampaignImageMediaInput>({
      block: image,
      input: point,
      previous: value,
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
    </Stack>
  )
}
