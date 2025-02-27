import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import Player from 'video.js/dist/types/player'

// Text constants to avoid literal strings
const PLAYER_STATS = 'Player Stats'
const BASIC_INFO = 'Basic Info'
const CURRENT_TIME = 'Current Time'
const DURATION = 'Duration'
const BUFFERED = 'Buffered'
const SEEKABLE = 'Seekable'
const EVENT_COUNTS = 'Event Counts'
const PLAY = 'Play'
const PLAYING = 'Playing'
const SEEKING = 'Seeking'
const SEEKED = 'Seeked'
const ENHANCED_INFO = 'Enhanced Info'
const BITRATE = 'Bitrate'
const CURRENT_QUALITY = 'Current Quality'
const FRAMERATE = 'Frame Rate'
const FPS = 'fps'
const KBPS = 'kbps'

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

function formatTimeRanges(timeRanges?: TimeRanges | null): string {
  if (!timeRanges) return '-'

  const ranges = []
  for (let i = 0; i < timeRanges.length; i++) {
    ranges.push(
      `${formatTime(timeRanges.start(i))}-${formatTime(timeRanges.end(i))}`
    )
  }
  return ranges.join(', ')
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getCurrentQuality(): string {
  const videoEl = document.querySelector('video')
  if (!videoEl) return ''

  const width = videoEl.videoWidth
  const height = videoEl.videoHeight
  return width && height ? `${width}x${height}` : ''
}

function getLiveFrameRate(player: Player): string | number {
  const videoEl = player.el().querySelector('video')
  if (!videoEl) return 'No video element'

  const time = player.currentTime() || 0
  if (time <= 0) return 'Buffering...'

  // Try different methods to get frame rate in order of preference
  if ('getVideoPlaybackQuality' in videoEl) {
    const quality = (videoEl as any).getVideoPlaybackQuality()
    const frames = quality?.totalVideoFrames
    if (frames > 0) return Math.round(frames / time)
  }

  if ('webkitDecodedFrameCount' in videoEl) {
    const frames = (videoEl as any).webkitDecodedFrameCount
    if (frames > 0) return Math.round(frames / time)
  }

  if ('mozParsedFrames' in videoEl) {
    const frames = (videoEl as any).mozParsedFrames
    if (frames > 0) return Math.round(frames / time)
  }

  return 'Not available'
}

export function VideoStats({ player, isHls = false }: VideoStatsProps) {
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

  const vhsRef = useRef<Vhs | null>(null)

  const updateStats = () => {
    if (!player) return

    const basicStats = {
      currentTime: player.currentTime() || 0,
      duration: player.duration() || 0,
      buffered: formatTimeRanges(player.buffered()),
      seekable: formatTimeRanges(player.seekable()),
      events: eventCountsRef.current
    }

    let enhancedStats = undefined
    const vhs = vhsRef.current

    if (vhs) {
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
  }

  useEffect(() => {
    if (!player) return

    const handleEvent = (eventName: string) => () => {
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
    }

    const events = ['play', 'playing', 'seeking', 'seeked']
    events.forEach((event) => {
      player.on(event, handleEvent(event))
    })

    const interval = setInterval(updateStats, 1000)

    return () => {
      events.forEach((event) => {
        player.off(event, handleEvent(event))
      })
      clearInterval(interval)
    }
  }, [player])

  useEffect(() => {
    if (!player || !isHls) return

    const tech = player.tech({ IWillNotUseThisInPlugins: true }) as any
    vhsRef.current = tech?.vhs ?? tech?.hls ?? player.vhs ?? player.hls
  }, [player, isHls])

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
      <Typography variant="h6">{PLAYER_STATS}</Typography>

      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        {BASIC_INFO}
      </Typography>
      <Box>
        <Typography variant="body2">{`${CURRENT_TIME}: ${formatTime(stats.basic.currentTime)}`}</Typography>
        <Typography variant="body2">{`${DURATION}: ${formatTime(stats.basic.duration)}`}</Typography>
        <Typography variant="body2">{`${BUFFERED}: ${stats.basic.buffered}`}</Typography>
        <Typography variant="body2">{`${SEEKABLE}: ${stats.basic.seekable}`}</Typography>
      </Box>

      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        {EVENT_COUNTS}
      </Typography>
      <Box>
        <Typography variant="body2">{`${PLAY}: ${stats.basic.events.play}`}</Typography>
        <Typography variant="body2">{`${PLAYING}: ${stats.basic.events.playing}`}</Typography>
        <Typography variant="body2">{`${SEEKING}: ${stats.basic.events.seeking}`}</Typography>
        <Typography variant="body2">{`${SEEKED}: ${stats.basic.events.seeked}`}</Typography>
      </Box>

      {stats.enhanced && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            {ENHANCED_INFO}
          </Typography>
          <Box>
            <Typography variant="body2">{`${CURRENT_QUALITY}: ${stats.enhanced.currentQuality}`}</Typography>
            <Typography variant="body2">
              {`${FRAMERATE}: ${typeof stats.enhanced.currentFrameRate === 'number' ? `${stats.enhanced.currentFrameRate}${FPS}` : stats.enhanced.currentFrameRate}`}
            </Typography>
            <Typography variant="body2">{`${BITRATE}: ${stats.enhanced.measuredBitrate} ${KBPS}`}</Typography>
          </Box>
        </>
      )}
    </Paper>
  )
}
