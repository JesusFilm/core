import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'

import VideoJsPlayer from '../utils/videoJsTypes'
import {
  formatTime,
  formatTimeRanges,
  getHtml5Stats,
  getYoutubeStats,
  isHtml5Tech,
  isYoutubeTech
} from '../utils/videoStatsUtils'

interface VideoStatsProps {
  player: VideoJsPlayer
}

interface BasicStats {
  currentTime: number
  duration: number
  buffered: string
  seekable: string
}

interface EnhancedHtml5Stats {
  measuredBitrate: number | string
  currentQuality: string
  currentFrameRate: string | number
}

interface EnhancedYoutubeStats {
  currentQuality: string
  bufferedPercent: number
}

interface StatsData {
  basic: BasicStats
  enhanced: EnhancedHtml5Stats | EnhancedYoutubeStats
  techType: 'youtube' | 'html5' | 'unknown'
}

export function VideoStats({ player }: VideoStatsProps) {
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
    },
    techType: 'unknown'
  })

  const updateStats = useCallback(() => {
    if (!player) return

    const basicStats: BasicStats = {
      currentTime: player.currentTime() || 0,
      duration: player.duration() || 0,
      buffered: formatTimeRanges(player.buffered()),
      seekable: formatTimeRanges(player.seekable())
    }

    // Get the tech instance once using the typed method
    const tech = player.tech({ IWillNotUseThisInPlugins: true })

    // Check if this is a YouTube video
    if (isYoutubeTech(tech)) {
      const youtubeStats = getYoutubeStats(tech, t)
      setStats({
        basic: basicStats,
        enhanced: youtubeStats,
        techType: 'youtube'
      })
    } else if (isHtml5Tech(tech)) {
      const html5Stats = getHtml5Stats(player)
      setStats({
        basic: basicStats,
        enhanced: html5Stats,
        techType: 'html5'
      })
    } else {
      setStats({
        basic: basicStats,
        enhanced: {
          measuredBitrate: '-',
          currentQuality: '-',
          currentFrameRate: '-'
        },
        techType: 'unknown'
      })
    }
  }, [player, t])

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
        {/* Display different stats based on video source */}
        {stats.techType === 'youtube' ? (
          <>
            <Typography variant="body2">{`${t('Current Quality')}: ${(stats.enhanced as EnhancedYoutubeStats).currentQuality}`}</Typography>
            <Typography variant="body2">{`${t('Buffered')}: ${(stats.enhanced as EnhancedYoutubeStats).bufferedPercent}%`}</Typography>
          </>
        ) : (
          <>
            <Typography variant="body2">{`${t('Current Quality')}: ${(stats.enhanced as EnhancedHtml5Stats).currentQuality}`}</Typography>
            <Typography variant="body2">
              {`${t('Frame Rate')}: ${typeof (stats.enhanced as EnhancedHtml5Stats).currentFrameRate === 'number' ? `${(stats.enhanced as EnhancedHtml5Stats).currentFrameRate}${t('fps')}` : (stats.enhanced as EnhancedHtml5Stats).currentFrameRate}`}
            </Typography>
            <Typography variant="body2">{`${t('Bitrate')}: ${(stats.enhanced as EnhancedHtml5Stats).measuredBitrate === '-' ? '-' : `${(stats.enhanced as EnhancedHtml5Stats).measuredBitrate} ${t('kbps')}`}`}</Typography>
          </>
        )}
      </Box>
    </Paper>
  )
}
