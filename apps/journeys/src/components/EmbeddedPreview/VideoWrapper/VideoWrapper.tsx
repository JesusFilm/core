import VideocamRounded from '@mui/icons-material/VideocamRounded'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'
import { ReactElement, useEffect, useMemo, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import type { TreeBlock } from '@core/journeys/ui/block'
import { blurImage } from '@core/journeys/ui/blurImage'
import { NextImage } from '@core/shared/ui/NextImage'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../__generated__/globalTypes'

const VIDEO_BACKGROUND_COLOR = '#000'
const VIDEO_FOREGROUND_COLOR = '#FFF'

export function VideoWrapper({
  block
}: {
  block: TreeBlock<VideoBlock>
}): ReactElement {
  const theme = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player>()

  const posterBlock = block.children.find(
    (child) =>
      child.id === block.posterBlockId && child.__typename === 'ImageBlock'
  ) as TreeBlock<ImageBlock> | undefined

  const blurBackground = useMemo(() => {
    return posterBlock != null
      ? blurImage(posterBlock.blurhash, theme.palette.background.paper)
      : undefined
  }, [posterBlock, theme])

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: false,
        controls: false,
        responsive: true,
        muted: true,

        // VideoJS blur background persists so we cover video when using png poster on non-autoplay videos
        poster: blurBackground
      })
      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(block.startAt ?? 0)
      })
    }
  }, [block, blurBackground])

  return (
    <Box
      data-testid={`EmbedVideoWrapper-${block.id}`}
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        minHeight: 'inherit',
        backgroundColor: VIDEO_BACKGROUND_COLOR,
        overflow: 'hidden',
        m: 0,
        position: 'absolute',
        top: 0,
        right: 0,
        '> .video-js': {
          width: '100%',
          display: 'flex',
          alignSelf: 'center',
          height: '100%',
          minHeight: 'inherit',
          '> .vjs-tech': {
            objectFit: 'cover'
          },
          '> .vjs-loading-spinner': {
            zIndex: 1,
            ...(block.source === VideoBlockSource.youTube && {
              display: 'none'
            })
          },
          '> .vjs-big-play-button': {
            zIndex: 1
          },
          '> .vjs-poster': {
            backgroundColor: VIDEO_BACKGROUND_COLOR,
            backgroundSize: 'cover'
          }
        },
        '> .MuiIconButton-root': {
          color: VIDEO_FOREGROUND_COLOR,
          position: 'absolute',
          bottom: 12,
          zIndex: 1,
          '&:hover': {
            color: VIDEO_FOREGROUND_COLOR
          }
        }
      }}
    >
      {/* If poster, show  poster. If not show paused video, if no video show placeholder */}
      {posterBlock?.src != null ? (
        <NextImage
          src={posterBlock.src}
          alt={posterBlock.alt}
          placeholder={blurBackground != null ? 'blur' : 'empty'}
          blurDataURL={blurBackground ?? posterBlock.src}
          layout="fill"
          objectFit="cover"
        />
      ) : block.videoId != null ? (
        <>
          <video
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            playsInline
          >
            {block.source === VideoBlockSource.cloudflare &&
              block.videoId != null && (
                <source
                  src={`https://customer-${
                    process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE ??
                    ''
                  }.cloudflarestream.com/${
                    block.videoId ?? ''
                  }/manifest/video.m3u8`}
                  type="application/x-mpegURL"
                />
              )}
            {block.source === VideoBlockSource.internal &&
              block.video?.variant?.hls != null && (
                <source
                  src={block.video.variant.hls}
                  type="application/x-mpegURL"
                />
              )}
            {block.source === VideoBlockSource.youTube && (
              <source
                src={`https://www.youtube.com/embed/${block.videoId}?start=${
                  block.startAt ?? 0
                }&end=${block.endAt ?? 0}`}
                type="video/youtube"
              />
            )}
          </video>
        </>
      ) : (
        <Paper
          sx={{
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            fontSize: 100,
            zIndex: 1,
            outline: 'none',
            outlineOffset: '-3px'
          }}
          elevation={0}
          variant="outlined"
        >
          <VideocamRounded
            fontSize="inherit"
            sx={{
              color: VIDEO_FOREGROUND_COLOR,
              filter: `drop-shadow(-1px 0px 5px ${VIDEO_BACKGROUND_COLOR})`
            }}
          />
        </Paper>
      )}
    </Box>
  )
}
