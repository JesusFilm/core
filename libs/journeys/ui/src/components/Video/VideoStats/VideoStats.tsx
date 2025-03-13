import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'

import VideoJsPlayer from '../utils/videoJsTypes'
import { formatTime } from '../utils/videoStatsUtils/formatTime'
import { formatTimeRanges } from '../utils/videoStatsUtils/formatTimeRanges'
import { getCurrentQuality } from '../utils/videoStatsUtils/getCurrentQuality'

interface VideoStatsProps {
  player: VideoJsPlayer
}

interface VideoStatsData {
  currentTime: number
  duration: number
  buffered: string
  seekable: string
  currentQuality: string
}

export function VideoStats({ player }: VideoStatsProps) {
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

    setStats({
      currentTime: player.currentTime() || 0,
      duration: player.duration() || 0,
      buffered: formatTimeRanges(player.buffered()),
      seekable: formatTimeRanges(player.seekable()),
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
