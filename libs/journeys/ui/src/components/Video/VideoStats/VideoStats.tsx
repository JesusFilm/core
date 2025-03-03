import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'
import Player from 'video.js/dist/types/player'

import {
  formatTime,
  formatTimeRanges,
  getCurrentQuality,
  getLiveFrameRate
} from './utils/videoStatsUtils'

interface VideoStatsProps {
  player: Player
  isHls?: boolean
}

interface StatsData {
  basic: {
    currentTime: number
    duration: number
    buffered: string
    seekable: string
  }
  enhanced: {
    measuredBitrate: number | string
    currentQuality: string
    currentFrameRate: string | number
  }
}

interface Vhs {
  stats?: {
    bandwidth?: number
    streamBitrate?: number
  }
  bandwidth?: number
  streamBitrate?: number
  playlists?: {
    master?: {
      playlists: Array<{
        attributes?: {
          FRAME_RATE?: number
        }
      }>
    }
  }
}

export function VideoStats({ player, isHls = false }: VideoStatsProps) {
  const { t } = useTranslation('libs-journeys-ui')

  const [stats, setStats] = useState<StatsData>({
    basic: {
      currentTime: 0,
      duration: 0,
      buffered: '-',
      seekable: '-'
    },
    enhanced: {
      measuredBitrate: '-',
      currentQuality: '-',
      currentFrameRate: '-'
    }
  })

  const updateStats = useCallback(() => {
    if (!player) return

    const basicStats = {
      currentTime: player.currentTime() || 0,
      duration: player.duration() || 0,
      buffered: formatTimeRanges(player.buffered()),
      seekable: formatTimeRanges(player.seekable())
    }

    // Default enhanced stats with hyphens
    let enhancedStats = {
      measuredBitrate: '-' as string | number,
      currentQuality: '-',
      currentFrameRate: '-' as string | number
    }

    const tech = player.tech(true) as any
    const vhs = tech?.vhs as Vhs

    if (isHls && vhs) {
      const streamBitrate =
        vhs.stats?.streamBitrate || vhs.streamBitrate || vhs.bandwidth || 0
      const liveFrameRate = getLiveFrameRate(player)

      enhancedStats = {
        measuredBitrate: streamBitrate || '-',
        currentQuality: getCurrentQuality() || '-',
        currentFrameRate: liveFrameRate || '-'
      }
    }

    setStats({
      basic: basicStats,
      enhanced: enhancedStats
    })
  }, [player, isHls])

  useEffect(() => {
    if (!player) return

    player.on('timeupdate', updateStats)

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

      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        {t('Basic Info')}
      </Typography>
      <Box>
        <Typography variant="body2">{`${t('Current Time')}: ${formatTime(stats.basic.currentTime)}`}</Typography>
        <Typography variant="body2">{`${t('Duration')}: ${formatTime(stats.basic.duration)}`}</Typography>
        <Typography variant="body2">{`${t('Buffered')}: ${stats.basic.buffered}`}</Typography>
        <Typography variant="body2">{`${t('Seekable')}: ${stats.basic.seekable}`}</Typography>
      </Box>

      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        {t('Enhanced Info')}
      </Typography>
      <Box>
        <Typography variant="body2">{`${t('Current Quality')}: ${stats.enhanced.currentQuality}`}</Typography>
        <Typography variant="body2">
          {`${t('Frame Rate')}: ${typeof stats.enhanced.currentFrameRate === 'number' ? `${stats.enhanced.currentFrameRate}${t('fps')}` : stats.enhanced.currentFrameRate}`}
        </Typography>
        <Typography variant="body2">{`${t('Bitrate')}: ${stats.enhanced.measuredBitrate === '-' ? '-' : `${stats.enhanced.measuredBitrate} ${t('kbps')}`}`}</Typography>
      </Box>
    </Paper>
  )
}
