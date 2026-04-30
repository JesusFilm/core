import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Box from '@mui/system/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'

import { getCaptionsAndSubtitleTracks } from '@core/journeys/ui/Video/utils/getCaptionsAndSubtitleTracks'
import VideoJsPlayer from '@core/journeys/ui/Video/utils/videoJsTypes'
import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import CheckIcon from '@core/shared/ui/icons/Check'

import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import type { VideoDetailsProps } from '../../VideoDetails/VideoDetails'

import 'video.js/dist/video-js.css'

export function MuxDetails({
  open,
  id,
  activeVideoBlock,
  onSelect,
  playbackId: providedPlaybackId
}: Pick<
  VideoDetailsProps,
  'open' | 'id' | 'activeVideoBlock' | 'onSelect' | 'playbackId'
>): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<VideoJsPlayer | null>(null)

  const blockPlaybackId =
    activeVideoBlock?.mediaVideo?.__typename === 'MuxVideo'
      ? activeVideoBlock.mediaVideo.playbackId
      : null

  const playbackId = blockPlaybackId ?? providedPlaybackId ?? null

  const updateSubtitleTracks = (player: VideoJsPlayer | null): void => {
    if (player == null) return

    const tracks = getCaptionsAndSubtitleTracks(player)
    tracks.forEach((track) => {
      if (track.kind === 'subtitles') {
        track.mode =
          (activeVideoBlock?.showGeneratedSubtitles ?? false)
            ? 'showing'
            : 'hidden'
      }
    })
  }

  useEffect(() => {
    if (open && videoRef.current != null && playbackId != null) {
      playerRef.current = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        fluid: true,
        controls: true,
        poster: `https://image.mux.com/${playbackId}/thumbnail.png?time=1`
      }) as VideoJsPlayer

      const player = playerRef.current

      const handleLoadedMetadata = (): void => {
        updateSubtitleTracks(playerRef.current)
      }

      player.on('loadedmetadata', handleLoadedMetadata)

      return () => {
        if (playerRef.current != null) {
          playerRef.current.off('loadedmetadata', handleLoadedMetadata)
          playerRef.current.dispose()
          playerRef.current = null
        }
      }
    }
  }, [
    open,
    playbackId,
    activeVideoBlock?.showGeneratedSubtitles
  ])

  useEffect(() => {
    updateSubtitleTracks(playerRef.current)
  })

  const handleSelect = (): void => {
    onSelect({
      videoId: id,
      source: VideoBlockSource.mux,
      startAt: 0
    })
  }

  return (
    <Stack spacing={4} sx={{ p: 6 }} data-testid="MuxDetails">
      <Box
        role="region"
        aria-label="Video Player"
        tabIndex={0}
        sx={{
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <video
          ref={videoRef}
          className="video-js vjs-tech vjs-big-play-centered"
          playsInline
        >
          {playbackId != null && (
            <source
              src={`https://stream.mux.com/${playbackId}.m3u8`}
              type="application/x-mpegURL"
            />
          )}
        </video>
      </Box>
      {activeVideoBlock == null && (
        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={handleSelect}
            size="small"
            sx={{ backgroundColor: 'secondary.dark' }}
            disabled={playbackId == null}
          >
            {t('Select')}
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
