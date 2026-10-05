import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { GetCampaign_campaign_blocks_CampaignFeaturedMediaBlock as CampaignFeaturedMediaBlock } from '../../../../__generated__/GetCampaign'
import { CampaignMediaSide } from '../../../../__generated__/globalTypes'
import {
  CampaignFeaturedMediaInput,
  useCampaignFeaturedMediaBlockUpdateMutation
} from '../../../libs/useCampaignFeaturedMediaBlockUpdateMutation'
import { CampaignMediaOwner } from '../../../libs/useCampaignMediaSlotMutation'
import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { CanvasMedia } from '../Canvas/CanvasMedia'
import { CampaignMediaPick, MediaPasteField } from '../Pickers/MediaPasteField'
import { useCampaignMediaCommand } from '../utils/useCampaignMediaCommand'

interface MediaSectionEditProps {
  block: CampaignMediaOwner
  onClose?: () => void
}

/**
 * The Edit of a section with a Media Slot (the hero and Featured Media):
 * the slot's current video or image, the media paste field to fill or
 * replace it (Watch or YouTube link, Mux upload, image) and Clear media;
 * for Featured Media also which side the media sits on. Each is one
 * Command; the section's text stays inline on the canvas.
 */
export function MediaSectionEdit({
  block,
  onClose
}: MediaSectionEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addMediaPick, clearMedia, addStyle, error } =
    useCampaignMediaCommand()
  const writeFeaturedMedia = useCampaignFeaturedMediaBlockUpdateMutation()
  const [replacing, setReplacing] = useState(false)
  const media =
    block.mediaBlockId == null
      ? undefined
      : campaign.blocks.find((candidate) => candidate.id === block.mediaBlockId)

  function handlePick(pick: CampaignMediaPick): void {
    setReplacing(false)
    addMediaPick(block, pick)
  }

  function handleClear(): void {
    setReplacing(false)
    clearMedia(block)
  }

  function handleMediaSide(mediaSide: CampaignMediaSide | null): void {
    if (block.__typename !== 'CampaignFeaturedMediaBlock') return
    if (mediaSide == null || mediaSide === block.mediaSide) return
    addStyle<CampaignFeaturedMediaBlock, CampaignFeaturedMediaInput>({
      block,
      input: { mediaSide },
      previous: { mediaSide: block.mediaSide },
      run: writeFeaturedMedia
    })
  }

  return (
    <Stack
      spacing={4}
      sx={{ p: 6, width: 400 }}
      data-testid="CampaignMediaSectionEdit"
      data-block-id={block.id}
    >
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{t('Edit')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {blockLabel(t, block.__typename)}
          </Typography>
        </Box>
        {onClose != null && (
          <IconButton aria-label={t('Close')} onClick={onClose}>
            <X2Icon />
          </IconButton>
        )}
      </Stack>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <Typography variant="subtitle2">{t('Media')}</Typography>
        {media != null ? (
          <Box data-testid="CampaignMediaSectionEditMedia">
            <CanvasMedia media={media} />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t(
              'No media: paste a Watch or YouTube link, upload a video or pick an image.'
            )}
          </Typography>
        )}
        {media != null && (
          <Stack direction="row" spacing={2}>
            {!replacing && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setReplacing(true)}
              >
                {t('Replace media')}
              </Button>
            )}
            <Button variant="text" size="small" onClick={handleClear}>
              {t('Clear media')}
            </Button>
          </Stack>
        )}
        {(media == null || replacing) && (
          <MediaPasteField
            teamId={campaign.teamId}
            uploadKey={block.id}
            onPick={handlePick}
          />
        )}
      </Stack>
      {block.__typename === 'CampaignFeaturedMediaBlock' && (
        <Stack spacing={2}>
          <Typography variant="subtitle2">{t('Media side')}</Typography>
          <ToggleButtonGroup
            value={block.mediaSide}
            exclusive
            size="small"
            onChange={(_event, value: CampaignMediaSide | null) =>
              handleMediaSide(value)
            }
            aria-label={t('Media side')}
          >
            <ToggleButton value={CampaignMediaSide.left}>
              {t('Left')}
            </ToggleButton>
            <ToggleButton value={CampaignMediaSide.right}>
              {t('Right')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      )}
    </Stack>
  )
}
