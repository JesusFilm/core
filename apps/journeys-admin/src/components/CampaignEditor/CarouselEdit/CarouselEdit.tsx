import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { CampaignVideoCarouselBlock } from '../../../libs/useCampaignVideoCarouselBlockUpdateMutation'
import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { CampaignMediaPick, MediaPasteField } from '../Pickers/MediaPasteField'
import { useCampaignCarouselCommand } from '../utils/useCampaignCarouselCommand'

interface CarouselEditProps {
  block: CampaignVideoCarouselBlock
  onClose?: () => void
}

/**
 * The Edit of a Video Carousel. One paste field fills it: a Watch link
 * expands that Video's children into cards (Watch expansion); a YouTube
 * video or an upload adds one explicit item; a YouTube playlist adds its
 * first 12. The paste field shows what a link resolved to before it is
 * kept. While expanded the panel shows the Watch video and offers "Use my
 * own videos" (explicit mode); the explicit items are reordered and removed
 * from their cards on the canvas. Each change is one Command.
 */
export function CarouselEdit({
  block,
  onClose
}: CarouselEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { setWatchVideo, clearWatchVideo, addItem, importPlaylist, error } =
    useCampaignCarouselCommand()
  const items = campaign.blocks.filter(
    (candidate) =>
      candidate.__typename === 'CampaignVideoBlock' &&
      candidate.parentBlockId === block.id &&
      candidate.parentOrder != null
  )
  const watchTitle =
    block.video?.title.find((title) => title.primary)?.value ??
    block.video?.title[0]?.value

  function handlePick(pick: CampaignMediaPick): void {
    if ('src' in pick) return
    if (pick.source === VideoBlockSource.internal) {
      setWatchVideo(block, pick.url)
      return
    }
    addItem(block, pick)
  }

  return (
    <Stack
      spacing={4}
      sx={{ p: 6, width: 400 }}
      data-testid="CampaignCarouselEdit"
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
        <Typography variant="subtitle2">{t('Videos')}</Typography>
        {block.videoId != null ? (
          <Stack spacing={2} data-testid="CampaignCarouselEditWatch">
            <Typography variant="body2">
              {watchTitle != null
                ? t('Showing the videos of {{title}} from Watch', {
                    title: watchTitle
                  })
                : t('Showing the videos of a Watch video')}
            </Typography>
            {block.video != null && block.video.childrenCount > 0 && (
              <Typography variant="caption" color="text.secondary">
                {t('{{count}} videos', { count: block.video.childrenCount })}
              </Typography>
            )}
            <Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => clearWatchVideo(block)}
              >
                {t('Use my own videos')}
              </Button>
            </Box>
          </Stack>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            data-testid="CampaignCarouselEditItems"
          >
            {items.length > 0
              ? t(
                  '{{count}} videos. Select a card on the canvas to move or remove it.',
                  { count: items.length }
                )
              : t(
                  'Paste a Watch link to show its videos, or add YouTube videos, a playlist or uploads.'
                )}
          </Typography>
        )}
        <MediaPasteField
          teamId={campaign.teamId}
          uploadKey={block.id}
          allowImage={false}
          onPick={handlePick}
          onPickPlaylist={(url) => importPlaylist(block, url)}
          testId="CampaignCarouselPasteField"
        />
      </Stack>
    </Stack>
  )
}
