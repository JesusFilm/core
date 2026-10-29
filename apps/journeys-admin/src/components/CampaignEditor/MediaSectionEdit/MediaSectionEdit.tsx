import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import {
  CampaignFeaturedMediaLayout,
  CampaignMediaSide
} from '../../../../__generated__/globalTypes'
import { CampaignMediaOwner } from '../../../libs/useCampaignBlockUpdateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { CanvasMedia } from '../Canvas/CanvasMedia'
import { FocalPointControl } from '../FocalPointControl'
import { CampaignMediaPick, MediaPasteField } from '../Pickers/MediaPasteField'
import { useCampaignMediaCommand } from '../utils/useCampaignMediaCommand'

interface MediaSectionEditProps {
  block: CampaignMediaOwner
}

/**
 * The Edit of a section with a Media Slot (the hero and Featured Media):
 * the slot's current video or image, the media paste field to fill or
 * replace it (Watch or YouTube link, Mux upload, image) and Clear media;
 * for Featured Media also its layout and which side the media sits on (the
 * side is disabled while stacked). Each is one Command; the section's text stays inline on the canvas.
 */
export function MediaSectionEdit({
  block
}: MediaSectionEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addMediaPick, clearMedia, addFields, error } =
    useCampaignMediaCommand()
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
    addFields(block, { mediaSide })
  }

  function handleLayout(layout: CampaignFeaturedMediaLayout | null): void {
    if (block.__typename !== 'CampaignFeaturedMediaBlock') return
    if (layout == null || layout === block.layout) return
    addFields(block, { layout })
  }

  return (
    <Stack
      spacing={4}
      data-testid="CampaignMediaSectionEdit"
      data-block-id={block.id}
    >
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <Typography variant="subtitle2">{t('Media')}</Typography>
        {media != null ? (
          <Box data-testid="CampaignMediaSectionEditMedia">
            <CanvasMedia
              media={media}
              stacked={
                block.__typename === 'CampaignFeaturedMediaBlock' &&
                block.layout === CampaignFeaturedMediaLayout.stacked
              }
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t(
              'No media: paste a Watch or YouTube link, upload a video or pick an image.'
            )}
          </Typography>
        )}
        {media?.__typename === 'CampaignImageBlock' && (
          <FocalPointControl image={media} />
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
          <Typography variant="subtitle2">{t('Layout')}</Typography>
          <ToggleButtonGroup
            value={block.layout}
            exclusive
            size="small"
            onChange={(_event, value: CampaignFeaturedMediaLayout | null) =>
              handleLayout(value)
            }
            aria-label={t('Layout')}
          >
            <ToggleButton value={CampaignFeaturedMediaLayout.sideBySide}>
              {t('Side by side')}
            </ToggleButton>
            <ToggleButton value={CampaignFeaturedMediaLayout.stacked}>
              {t('Stacked')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      )}
      {block.__typename === 'CampaignFeaturedMediaBlock' && (
        <Stack spacing={2}>
          <Typography variant="subtitle2">{t('Media side')}</Typography>
          <ToggleButtonGroup
            value={block.mediaSide}
            exclusive
            size="small"
            disabled={block.layout === CampaignFeaturedMediaLayout.stacked}
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
