import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useRef, useState } from 'react'
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
    events: {
      play: number
      playing: number
      seeking: number
      seeked: number
    }
  }
  enhanced?: {
    measuredBitrate: number
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
  const eventCountsRef = useRef({
    play: 0,
    playing: 0,
    seeking: 0,
    seeked: 0
  })

  const [stats, setStats] = useState<StatsData>({
    basic: {
      currentTime: 0,
      duration: 0,
      buffered: '-',
      seekable: '-',
      events: eventCountsRef.current
    }
  })

  const handleEvent = useCallback(
    (eventName: string) => () => {
      eventCountsRef.current[
        eventName as keyof typeof eventCountsRef.current
      ] += 1
      setStats((prev) => ({
        ...prev,
        basic: {
          ...prev.basic,
          events: { ...eventCountsRef.current }
        }
      }))
    },
    []
  )

  const updateStats = useCallback(() => {
    if (!player) return

    const basicStats = {
      currentTime: player.currentTime() || 0,
      duration: player.duration() || 0,
      buffered: formatTimeRanges(player.buffered()),
      seekable: formatTimeRanges(player.seekable()),
      events: eventCountsRef.current
    }

    let enhancedStats = undefined
    const tech = player.tech(true) as any

    const vhs = tech.vhs as Vhs

    if (isHls && vhs) {
      const streamBitrate =
        vhs.stats?.streamBitrate || vhs.streamBitrate || vhs.bandwidth || 0
      const liveFrameRate = getLiveFrameRate(player)

      enhancedStats = {
        measuredBitrate: streamBitrate,
        currentQuality: getCurrentQuality(),
        currentFrameRate: liveFrameRate
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

    const events = ['play', 'playing', 'seeking', 'seeked']
    events.forEach((event) => {
      player.on(event, handleEvent(event))
    })

    return () => {
      player.off('timeupdate', updateStats)
      events.forEach((event) => {
        player.off(event, handleEvent(event))
      })
    }
  }, [player, updateStats, handleEvent])

  return (
    <Paper
      sx={{
        position: 'absolute',
        bottom: 60,
        right: 10,
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
        {t('Event Counts')}
      </Typography>
      <Box>
        <Typography variant="body2">{`${t('Play')}: ${stats.basic.events.play}`}</Typography>
        <Typography variant="body2">{`${t('Playing')}: ${stats.basic.events.playing}`}</Typography>
        <Typography variant="body2">{`${t('Seeking')}: ${stats.basic.events.seeking}`}</Typography>
        <Typography variant="body2">{`${t('Seeked')}: ${stats.basic.events.seeked}`}</Typography>
      </Box>

      {stats.enhanced && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            {t('Enhanced Info')}
          </Typography>
          <Box>
            <Typography variant="body2">{`${t('Current Quality')}: ${stats.enhanced.currentQuality}`}</Typography>
            <Typography variant="body2">
              {`${t('Frame Rate')}: ${typeof stats.enhanced.currentFrameRate === 'number' ? `${stats.enhanced.currentFrameRate}${t('fps')}` : stats.enhanced.currentFrameRate}`}
            </Typography>
            <Typography variant="body2">{`${t('Bitrate')}: ${stats.enhanced.measuredBitrate} ${t('kbps')}`}</Typography>
          </Box>
        </>
      )}
    </Paper>
  )
}
