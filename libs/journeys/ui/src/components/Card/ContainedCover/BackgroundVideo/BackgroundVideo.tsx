import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { CSSProperties, ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultBackgroundVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import { VideoFields } from '../../../Video/__generated__/VideoFields'
import { disableVisibleTextTracks } from '../../../Video/utils/disableVisibleTextTracks'
import { getYouTubePlayer } from '../../../Video/utils/getYouTubePlayer'
import { unloadYouTubeCaptions } from '../../../Video/utils/unloadYouTubeCaptions'
import VideoJsPlayer from '../../../Video/utils/videoJsTypes'
import { YoutubeTech } from '../../../Video/utils/videoJsTypes/YoutubeTech'

import 'videojs-youtube'
import 'video.js/dist/video-js.css'

interface BackgroundVideoProps extends TreeBlock<VideoFields> {
  setLoading: (loading: boolean) => void
  cardColor: string
}

const StyledVideo = styled('video')(() => ({}))

export function BackgroundVideo({
  source,
  children,
  mediaVideo,
  videoId,
  startAt,
  endAt,
  objectFit,
  setLoading
}: BackgroundVideoProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)
  const isYouTube = source === VideoBlockSource.youTube

  // Initiate Video
  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        ...defaultBackgroundVideoJsOptions,
        autoplay: true,
        controls: false,
        controlBar: false,
        bigPlayButton: false,
        preload: 'metadata',
        // Make video fill container instead of set aspect ratio
        fill: true,
        userActions: {
          hotkeys: false,
          doubleClick: false
        },
        muted: true,
        loop: true,
        responsive: true
        // Don't use poster prop as image isn't optimised
      })
    }
  }, [])

  // Set up video listeners
  useEffect(() => {
    const player = playerRef.current
    if (player != null) {
      // Video jumps to new time and finishes loading
      player.on('ready', () => {
        player.currentTime(startAt ?? 0)
        void player.play()
      })
      player.on('seeked', () => {
        setLoading(false)
      })
      player.on('pause', () => {
        // 2) Loop video if at end
        const currentTime = player.currentTime() ?? 0
        if (
          currentTime < (startAt ?? 0) ||
          (endAt != null && currentTime >= endAt)
        ) {
          player?.currentTime(startAt ?? 0)
          void player?.play()
        }
      })
      player.on('timeupdate', () => {
        const currentTime = player?.currentTime() ?? 0
        if (
          currentTime < (startAt ?? 0) ||
          (endAt != null && currentTime >= endAt)
        ) {
          player?.pause()
        }
      })

      player.ready(() => {
        if (
          mediaVideo?.__typename === 'MuxVideo' &&
          mediaVideo?.playbackId != null
        ) {
          player.src({
            src: `https://stream.mux.com/${mediaVideo.playbackId}.m3u8`,
            type: 'application/x-mpegURL'
          })
        }
        if (
          mediaVideo?.__typename === 'Video' &&
          mediaVideo?.variant?.hls != null
        ) {
          player.src({
            src: mediaVideo.variant.hls,
            type: 'application/x-mpegURL'
          })
        }
      })
    }
  }, [playerRef, startAt, endAt, source, mediaVideo, videoId, setLoading])

  // Background videos never show captions, whatever the source or subtitle
  // setting: like muted and autoplay, they have no controls to change it.
  // Streams bring their own tracks (e.g. iOS Safari auto-selects the
  // AUTOSELECT=YES track in Mux and library HLS manifests), so turn every
  // track off as it arrives and whenever the browser switches one on
  useEffect(() => {
    const player = playerRef.current as VideoJsPlayer | null
    if (player == null) return

    const textTracks = player.textTracks?.()
    const handleTextTracksChange = (): void => disableVisibleTextTracks(player)
    handleTextTracksChange()
    textTracks?.addEventListener('addtrack', handleTextTracksChange)
    textTracks?.addEventListener('change', handleTextTracksChange)
    return () => {
      textTracks?.removeEventListener('addtrack', handleTextTracksChange)
      textTracks?.removeEventListener('change', handleTextTracksChange)
    }
  }, [])

  // YouTube draws captions inside its iframe, outside video.js text tracks,
  // and can load its captions module at any point (signalled by
  // onApiChange), e.g. for a viewer whose account always shows captions
  useEffect(() => {
    const player = playerRef.current as VideoJsPlayer | null
    if (player == null || !isYouTube) return

    const handlePlaying = (): void => {
      unloadYouTubeCaptions(getYouTubePlayer(player))
    }
    let isCleanedUp = false
    let ytPlayer: YoutubeTech['ytPlayer'] | null = null
    const handleApiChange = (): void => {
      // Unloading fires onApiChange again, so only unload a loaded module.
      // getOptions is undocumented; without it, leave unloading to 'playing'
      const loadedModules = ytPlayer?.getOptions?.()
      if (loadedModules == null) return
      if (!loadedModules.includes('captions') && !loadedModules.includes('cc'))
        return
      unloadYouTubeCaptions(ytPlayer)
    }

    player.on('playing', handlePlaying)
    player.ready(() => {
      if (isCleanedUp) return
      ytPlayer = getYouTubePlayer(player)
      ytPlayer?.addEventListener?.('onApiChange', handleApiChange)
    })
    return () => {
      isCleanedUp = true
      player.off('playing', handlePlaying)
      ytPlayer?.removeEventListener?.('onApiChange', handleApiChange)
    }
  }, [isYouTube])

  useEffect(() => {
    if (videoRef.current != null) videoRef.current.pause()
  }, [])

  let videoFit: CSSProperties['objectFit']
  if (source === VideoBlockSource.youTube) {
    videoFit = 'contain'
  } else {
    switch (objectFit) {
      case VideoBlockObjectFit.fit:
      case VideoBlockObjectFit.zoomed:
        videoFit = 'contain'
        break
      default:
        videoFit = 'cover'
        break
    }
  }

  return (
    <Box
      data-testid="CardContainedBackgroundVideo"
      sx={{
        height: '100%',
        width: '100%',
        minHeight: '-webkit-fill-available',
        overflow: 'hidden',
        position: 'absolute'
      }}
    >
      <StyledVideo
        ref={videoRef}
        data-testid="background-video"
        className="vjs-fill video-js"
        playsInline
        sx={{
          '&.video-js.vjs-fill:not(.vjs-audio-only-mode)': {
            height: isYouTube ? 'inherit' : '100%',
            transform: isYouTube
              ? {
                  xs: 'scale(4)',
                  sm: 'scale(1.3)',
                  md: 'scale(2.65)',
                  lg: 'scale(1.2)'
                }
              : 'unset',
            // Offset applies to the xs (portrait) layout only. From sm up the card content
            // sits beside the video, so an offset leaves a gap under the footer.
            bottom: { xs: children.length !== 0 ? 50 : 0, sm: 0 }
          },
          '> .vjs-tech': {
            objectFit: videoFit,
            transform:
              objectFit === VideoBlockObjectFit.zoomed
                ? 'scale(1.33)'
                : undefined
          },
          '> .vjs-loading-spinner': {
            zIndex: 1,
            display: isYouTube ? 'none' : 'flex'
          },
          pointerEvents: 'none'
        }}
      >
        {mediaVideo?.__typename === 'Video' &&
          mediaVideo?.variant?.hls != null && (
            <source src={mediaVideo.variant.hls} type="application/x-mpegURL" />
          )}
        {source === VideoBlockSource.youTube && videoId != null && (
          <source
            src={`https://www.youtube.com/embed/${videoId}?start=${
              startAt ?? 0
            }&end=${endAt ?? 0}`}
            type="video/youtube"
          />
        )}
        {mediaVideo?.__typename === 'MuxVideo' &&
          mediaVideo?.playbackId != null && (
            <source
              src={`https://stream.mux.com/${mediaVideo.playbackId}.m3u8`}
              type="application/x-mpegURL"
            />
          )}
      </StyledVideo>
    </Box>
  )
}
