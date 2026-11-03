import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName } from '@core/shared/ui/themes'

import {
  CampaignStringKey,
  ThemeMode
} from '../../../../__generated__/globalTypes'
import type { VideoProps } from '../../Video'
import { CampaignPicture } from '../CampaignImage'
import { CampaignMutedText } from '../CampaignMutedText'
import { useCampaign } from '../CampaignProvider'
import { campaignImageSource } from '../libs/campaignImageSource'
import { campaignCardSx } from '../libs/campaignSx'
import type { CampaignTreeOf } from '../types'

import {
  CampaignVideoDetails,
  campaignSubtitleTracks,
  campaignVideoDetails,
  campaignVideoPlayerBlock
} from './campaignVideoDetails'
import { CampaignVideoFrame } from './CampaignVideoFrame'
import { videoCountLabel } from './videoCountLabel'

/** The journeys player and video.js, fetched on the client only when a page plays a video inline. */
const Video = dynamic<VideoProps>(
  async () =>
    await import(
      /* webpackChunkName: "CampaignVideoPlayer" */
      '../../Video'
    ).then((mod) => mod.Video),
  { ssr: false }
)

interface CampaignVideoProps {
  block: CampaignTreeOf<'CampaignVideoBlock'>
  /** The Hero's media: the poster loads at once with high priority. */
  eager?: boolean
}

function CampaignVideoCaption({
  details
}: {
  details: CampaignVideoDetails
}): ReactElement | null {
  if (details.title == null && details.description == null) return null
  return (
    <Stack component="figcaption" spacing={0.5}>
      {details.title != null && (
        <Typography
          variant="subtitle1"
          component="p"
          data-testid="CampaignVideoTitle"
          sx={{ color: 'var(--campaign-band-heading)', whiteSpace: 'pre-line' }}
        >
          {details.title}
        </Typography>
      )}
      {details.description != null && (
        <Typography
          variant="body2"
          data-testid="CampaignVideoDescription"
          sx={{
            color: 'var(--campaign-band-muted)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            whiteSpace: 'pre-line'
          }}
        >
          {details.description}
        </Typography>
      )}
    </Stack>
  )
}

/**
 * A Campaign Video in a Media Slot. A Watch video with children is a poster
 * card — its title in the Page Language and "<n> videos" — linking out to
 * Watch; any other video plays inline in the journeys `Video` player, framed
 * at 16:9 and captioned with its title and description, with the variant's
 * subtitle files offered in the player's subtitle menu. The player is loaded
 * on the client only, so a page without a video never fetches it; the
 * frame's poster is server-rendered and the player mounts over it (eagerly
 * loaded when `eager`). The player sits in the dark theme whatever the
 * band's, so its controls read white over the picture as they do on a
 * journey card.
 */
export function CampaignVideo({
  block,
  eager = false
}: CampaignVideoProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { campaign, string } = useCampaign()
  const details = useMemo(
    () => campaignVideoDetails(block, campaign.languageId),
    [block, campaign.languageId]
  )
  const playerBlock = useMemo(
    () => campaignVideoPlayerBlock(block, details),
    [block, details]
  )
  const subtitleTracks = useMemo(() => campaignSubtitleTracks(block), [block])
  const poster = campaignImageSource(block)

  if (details.childrenCount > 0) {
    return (
      <ButtonBase
        component="a"
        href={details.watchHref ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`CampaignVideoCard-${block.id}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          width: '100%',
          overflow: 'hidden',
          ...campaignCardSx,
          textAlign: 'start'
        }}
      >
        <CampaignVideoFrame poster={details.poster} />
        <Stack spacing={0.5} sx={{ p: 3 }}>
          {details.title != null && (
            <Typography
              variant="h5"
              component="span"
              sx={{
                color: 'var(--campaign-band-heading)',
                whiteSpace: 'pre-line'
              }}
            >
              {details.title}
            </Typography>
          )}
          <CampaignMutedText variant="body2" component="span">
            {videoCountLabel(
              details.childrenCount,
              string(CampaignStringKey.videos),
              t
            )}
          </CampaignMutedText>
        </Stack>
      </ButtonBase>
    )
  }

  return (
    <Stack
      component="figure"
      spacing={1.5}
      data-testid={`CampaignVideo-${block.id}`}
      sx={{ m: 0, width: '100%' }}
    >
      <CampaignVideoFrame
        sx={{
          width: '100%',
          overflow: 'hidden',
          borderRadius: 1,
          backgroundColor: '#000'
        }}
      >
        {poster != null && <CampaignPicture image={poster} eager={eager} />}
        <ThemeProvider
          themeName={ThemeName.base}
          themeMode={ThemeMode.dark}
          nested
        >
          <Video
            {...playerBlock}
            subtitleTracks={subtitleTracks}
            reapplyServerSource
          />
        </ThemeProvider>
      </CampaignVideoFrame>
      <CampaignVideoCaption details={details} />
    </Stack>
  )
}
