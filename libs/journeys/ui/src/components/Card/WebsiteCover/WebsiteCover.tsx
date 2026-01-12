import Box from '@mui/material/Box'
import { ReactElement, ReactNode, useState } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { BackgroundVideo } from '../ContainedCover/BackgroundVideo'
import { OverlayContent } from '../OverlayContent'
import { stripAlphaFromHex } from '../utils/colorOpacityUtils'

/**
 * Props for `WebsiteCover`.
 *
 * - `children`: Foreground overlay elements rendered on top of the cover.
 * - `backgroundColor`: Card background color; alpha channel is stripped for base background.
 * - `backgroundBlur` (optional): Blur placeholder data URL for images (e.g., base64).
 * - `videoBlock` (optional): Background video block configuration, including poster lookup.
 * - `imageBlock` (optional): Background image block when no video is used; honors focal point and scale.
 * - `hasFullscreenVideo` (optional): Adjusts overlay spacing when a fullscreen video CTA is present.
 */
interface WebsiteCoverProps {
  children: ReactNode[]
  backgroundColor: string
  backgroundBlur?: string
  videoBlock?: TreeBlock<VideoFields>
  imageBlock?: TreeBlock<ImageFields>
  hasFullscreenVideo?: boolean
}

/** Responsive minimum heights for media areas to ensure a visible cover region. */
const MEDIA_HEIGHT = { xs: '320px', md: '480px' }

/**
 * WebsiteCover displays a full-viewport-height cover area with an optional background
 * video or image and renders the provided overlay content in the foreground.
 *
 * Behavior:
 * - If `videoBlock` is provided, a background video is shown with a poster while loading.
 * - If `imageBlock` and `backgroundBlur` are provided, a responsive image background is shown.
 *
 * Returns a `Box` container filling the viewport height with media and overlay content.
 */
export function WebsiteCover({
  children,
  backgroundColor,
  backgroundBlur,
  videoBlock,
  imageBlock,
  hasFullscreenVideo = false
}: WebsiteCoverProps): ReactElement {
  const [loading, setLoading] = useState(true)
  const baseBackgroundColor = stripAlphaFromHex(backgroundColor)

  /**
   * Compute the most appropriate poster image for the background video:
   * - Prefer an explicitly linked poster image block if present.
   * - Fall back to the video's first available cinematic image.
   * - If the media is not a hosted video, use the video block's image.
   */
  const posterImage =
    videoBlock?.mediaVideo?.__typename === 'Video'
      ? videoBlock?.posterBlockId != null
        ? videoBlock.children.find(
            (block): block is TreeBlock<ImageFields> =>
              block.__typename === 'ImageBlock' &&
              block.id === videoBlock.posterBlockId
          )?.src
        : videoBlock?.mediaVideo?.images[0]?.mobileCinematicHigh
      : videoBlock?.image

  /** Background video section; rendered only when `videoBlock` is provided. */
  const VideoSection = videoBlock ? (
    <Box
      data-testid="website-cover-video"
      sx={{
        position: 'relative',
        width: '100%',
        flex: 1,
        minHeight: MEDIA_HEIGHT,
        overflow: 'hidden'
      }}
    >
      <BackgroundVideo
        {...videoBlock}
        setLoading={setLoading}
        cardColor={backgroundColor}
      />
      {posterImage != null && loading && (
        <NextImage
          data-testid="video-poster-image"
          className="vjs-poster"
          src={posterImage}
          aria-details={posterImage}
          alt="card video image"
          layout="fill"
          objectFit="cover"
          sx={{
            transform:
              videoBlock.source === VideoBlockSource.youTube
                ? 'scale(2)'
                : 'unset'
          }}
        />
      )}
    </Box>
  ) : null

  /**
   * Background image section with blur placeholder; rendered when `imageBlock`
   * and `backgroundBlur` are both provided.
   */
  const ImageSection =
    imageBlock != null && backgroundBlur != null ? (
      <Box
        data-testid="website-cover-image"
        sx={{
          position: 'relative',
          width: '100%',
          flex: 1,
          minHeight: MEDIA_HEIGHT
        }}
      >
        <NextImage
          src={imageBlock.src ?? backgroundBlur}
          alt={imageBlock.alt}
          placeholder="blur"
          blurDataURL={backgroundBlur}
          layout="fill"
          objectFit="cover"
          objectPosition={`${imageBlock.focalLeft}% ${imageBlock.focalTop}%`}
          sx={{
            transform: `scale(${(imageBlock.scale ?? 100) / 100})`,
            transformOrigin: `${imageBlock.focalLeft}% ${imageBlock.focalTop}%`
          }}
        />
      </Box>
    ) : null

  return (
    <Box
      data-testid="website-cover"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'scroll',
        overflowX: 'hidden',
        backgroundColor: baseBackgroundColor,
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
        '-ms-overflow-style': 'none'
      }}
    >
      {VideoSection}
      {ImageSection}

      <Box data-testid="website-cover-content">
        <OverlayContent
          hasFullscreenVideo={hasFullscreenVideo}
          sx={{
            mx: 'auto',
            width: {
              xs: 'calc(100% - 32px - env(safe-area-inset-left) - env(safe-area-inset-right))',
              sm: 360,
              md: 500,
              lg: 767
            }
          }}
        >
          {children}
        </OverlayContent>
      </Box>
    </Box>
  )
}
