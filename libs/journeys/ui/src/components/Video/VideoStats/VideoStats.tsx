import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'

import VideoJsPlayer from '../utils/videoJsTypes'
import { formatTime } from '../utils/videoStatsUtils/formatTime'
import { formatTimeRanges } from '../utils/videoStatsUtils/formatTimeRanges'
import { getCurrentQuality } from '../utils/videoStatsUtils/getCurrentQuality'

/**
 * Props for the VideoStats component
 */
interface VideoStatsProps {
  /** The video.js player instance */
  player: VideoJsPlayer
  /** The start time of the trimmed video section in seconds */
  startAt: number
  /** The end time of the trimmed video section in seconds */
  endAt: number
}

/**
 * Data structure for video statistics
 * All time values are relative to the trimmed video section
 */
interface VideoStatsData {
  /** Current playback position relative to startAt */
  currentTime: number
  /** Duration of the trimmed video section */
  duration: number
  /** Formatted string of buffered time ranges */
  buffered: string
  /** Formatted string of seekable time ranges */
  seekable: string
  /** Current video quality/resolution */
  currentQuality: string
}

/**
 * VideoStats component displays technical information about the video playback
 * All displayed times are adjusted to be relative to the trimmed video section
 */
export function VideoStats({ player, startAt, endAt }: VideoStatsProps) {
  const { t } = useTranslation('libs-journeys-ui')

  const [stats, setStats] = useState<VideoStatsData>({
    currentTime: 0,
    duration: 0,
    buffered: '-',
    seekable: '-',
    currentQuality: '-'
  })

  const updateStats = useCallback(() => {
    if (!player) return

    const rawCurrentTime = player.currentTime() || 0

    const adjustedCurrentTime = Math.max(0, rawCurrentTime - startAt)

    const duration = Math.max(0, endAt - startAt)

    const formattedSeekable = formatTimeRanges(
      player.seekable(),
      startAt,
      endAt
    )

    const formattedBuffered = formatTimeRanges(
      player.buffered(),
      startAt,
      endAt
    )

    setStats({
      currentTime: adjustedCurrentTime,
      duration,
      buffered: formattedBuffered,
      seekable: formattedSeekable,
      currentQuality: getCurrentQuality({ player, t })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player])

  useEffect(() => {
    if (!player) return

    player.on('timeupdate', updateStats)

    // Initial update
    updateStats()

    return () => {
      player.off('timeupdate', updateStats)
    }
  }, [player, updateStats])

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 2,
        padding: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        maxWidth: 300,
        maxHeight: 400,
        overflow: 'auto',
        borderRadius: 1
      }}
    >
      <Typography variant="h6">{t('Player Stats')}</Typography>

      <Box>
        <Typography variant="body2">{`${t('Current Time')}: ${formatTime(stats.currentTime)}`}</Typography>
        <Typography variant="body2">{`${t('Duration')}: ${formatTime(stats.duration)}`}</Typography>
        <Typography variant="body2">{`${t('Buffered')}: ${stats.buffered}`}</Typography>
        <Typography variant="body2">{`${t('Seekable')}: ${stats.seekable}`}</Typography>
        <Typography variant="body2">{`${t('Current Quality')}: ${stats.currentQuality}`}</Typography>
      </Box>
    </Paper>
  )
}
