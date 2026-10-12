import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { campaignImageSource } from '@core/journeys/ui/Campaign'
import Play3Icon from '@core/shared/ui/icons/Play3'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'

/** The title a Media Slot video shows: the override (or text captured at pick), else the Watch video's own. */
export function campaignVideoTitle(
  block: Extract<CampaignBlock, { __typename: 'CampaignVideoBlock' }>
): string | null {
  if (block.title != null && block.title.trim() !== '') return block.title
  if (block.mediaVideo?.__typename !== 'Video') return null
  return block.mediaVideo.title[0]?.value ?? null
}

interface CanvasMediaProps {
  /** The block in the Media Slot; null shows the empty-slot placeholder. */
  media: CampaignBlock | null
}

/**
 * A Media Slot as the editor previews it: an image, a video's poster with
 * its title (and "<n> videos" for a Watch video with children), or a dashed
 * placeholder pointing at Edit when the slot is empty.
 */
export function CanvasMedia({ media }: CanvasMediaProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  if (media?.__typename === 'CampaignImageBlock') {
    const picture = campaignImageSource(media)
    if (picture != null)
      return (
        <Box
          component="img"
          src={picture.src}
          alt={picture.alt ?? ''}
          data-testid="CanvasMediaImage"
          sx={{
            display: 'block',
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: 1
          }}
        />
      )
  }

  if (media?.__typename === 'CampaignVideoBlock') {
    const poster = campaignImageSource(media)
    const title = campaignVideoTitle(media)
    const childrenCount =
      media.mediaVideo?.__typename === 'Video'
        ? media.mediaVideo.childrenCount
        : 0
    return (
      <Box
        data-testid="CanvasMediaVideo"
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'grey.900',
          color: 'common.white'
        }}
      >
        {poster != null && (
          <Box
            component="img"
            src={poster.src}
            alt=""
            data-testid="CanvasMediaVideoPoster"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0) 60%)'
          }}
        >
          <Play3Icon sx={{ fontSize: 48 }} />
        </Box>
        <Stack sx={{ position: 'absolute', left: 16, right: 16, bottom: 12 }}>
          <Typography variant="subtitle1" noWrap>
            {title ?? t('Video')}
          </Typography>
          {childrenCount > 0 && (
            <Typography variant="caption">
              {t('{{count}} videos', { count: childrenCount })}
            </Typography>
          )}
        </Stack>
      </Box>
    )
  }

  return (
    <Box
      data-testid="CanvasMediaPlaceholder"
      sx={{
        width: '100%',
        aspectRatio: '16 / 9',
        border: '1px dashed var(--campaign-band-border)',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--campaign-band-muted)'
      }}
    >
      <Typography variant="body2">{t('Add media from Edit')}</Typography>
    </Box>
  )
}
