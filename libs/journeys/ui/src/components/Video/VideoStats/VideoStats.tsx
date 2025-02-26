import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useRef, useState } from 'react'
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
const VIDEO_BITRATE = 'Video Bitrate'
const MEASURED_BITRATE = 'Measured Bitrate'
const VIDEO_BUFFERED = 'Video Buffered'
const AUDIO_BUFFERED = 'Audio Buffered'
const VIDEO_TIMESTAMP_OFFSET = 'Video Timestamp Offset'
const AUDIO_TIMESTAMP_OFFSET = 'Audio Timestamp Offset'
const QUALITY_LEVELS = 'Quality Levels'
const KBPS = 'kbps'
const ENABLED = 'enabled'
const DISABLED = 'disabled'
const TECH_INFO = 'Tech Info'
const TECH_NAME = 'Tech Name'
const SOURCE_TYPE = 'Source Type'
const VHS_AVAILABLE = 'VHS Available'
const YES = 'Yes'
const NO = 'No'
const HLS_SOURCE = 'HLS Source'
const NO_QUALITY_LEVELS = 'No quality levels available'
const VHS_MODULE_LOADED = 'VHS Module Loaded'

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
  tech: {
    name: string
    sourceType: string
    vhsAvailable: boolean
    isHlsSource: boolean
    vhsModuleLoaded: boolean
  }
  enhanced?: {
    videoBitrate: number
    measuredBitrate: number
    videoBuffered: string
    audioBuffered: string
    videoTimestampOffset: number
    audioTimestampOffset: number
    qualityLevels: Array<{
      id: string
      width: number
      height: number
      bitrate: number
      enabled: boolean
    }>
  }
}

// Define interfaces for VHS-specific properties
interface VhsStats {
  bandwidth?: number
  streamBitrate?: number
  videoBuffered?: TimeRanges
  audioBuffered?: TimeRanges
}

interface SourceUpdater {
  videoBuffer?: {
    timestampOffset?: number
  }
  audioBuffer?: {
    timestampOffset?: number
  }
}

interface Vhs {
  stats?: VhsStats
  sourceUpdater?: SourceUpdater
}

interface TechWithVhs {
  vhs?: Vhs
  name_?: string
  el_?: {
    type?: string
  }
}

interface QualityLevel {
  id: string
  width: number
  height: number
  bitrate: number
  enabled: boolean
}

interface QualityLevelList {
  length: number
  [index: number]: QualityLevel
}

interface PlayerWithQualityLevels extends Player {
  qualityLevels?: () => QualityLevelList
}

export function VideoStats({ player, isHls = false }: VideoStatsProps) {
  // Use a ref to store event counts to prevent them from being reset
  const eventCountsRef = useRef({
    play: 0,
    playing: 0,
    seeking: 0,
    seeked: 0
  })

  // Check if videojs-http-streaming module is loaded
  const isVhsModuleLoaded = useMemo(() => {
    // Check if videojs has the HttpStreaming property
    return Boolean(
      (window as any).videojs?.HttpStreaming ||
        (window as any).videojs?.getComponent?.('HttpStreaming')
    )
  }, [])

  const [stats, setStats] = useState<StatsData>({
    basic: {
      currentTime: 0,
      duration: 0,
      buffered: '-',
      seekable: '-',
      events: eventCountsRef.current
    },
    tech: {
      name: '-',
      sourceType: '-',
      vhsAvailable: false,
      isHlsSource: false,
      vhsModuleLoaded: isVhsModuleLoaded
    }
  })

  // Add a ref to store the VHS instance
  const vhsRef = useRef<any>(null)

  useEffect(() => {
    if (!player) return

    // Set up event listeners for counting events
    const eventHandlers = {
      play: () => {
        eventCountsRef.current.play += 1
        setStats((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            events: { ...eventCountsRef.current }
          }
        }))
      },
      playing: () => {
        eventCountsRef.current.playing += 1
        setStats((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            events: { ...eventCountsRef.current }
          }
        }))
      },
      seeking: () => {
        eventCountsRef.current.seeking += 1
        setStats((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            events: { ...eventCountsRef.current }
          }
        }))
      },
      seeked: () => {
        eventCountsRef.current.seeked += 1
        setStats((prev) => ({
          ...prev,
          basic: {
            ...prev.basic,
            events: { ...eventCountsRef.current }
          }
        }))
      }
    }

    // Add event listeners
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      player.on(event, handler)
    })

    // Set up interval for regular stats updates
    const interval = setInterval(() => {
      updateStats()
    }, 1000)

    return () => {
      // Clean up event listeners
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        player.off(event, handler)
      })
      clearInterval(interval)
    }
  }, [player])

  // Add a useEffect to initialize VHS tech for HLS streams
  useEffect(() => {
    if (player && isHls) {
      try {
        // If VHS module is not loaded, try to load it dynamically
        if (!isVhsModuleLoaded) {
          console.log('VHS module not detected, attempting to load dynamically')

          // Try to load the VHS module from CDN
          const script = document.createElement('script')
          script.src =
            'https://unpkg.com/videojs-http-streaming@2.16.2/dist/videojs-http-streaming.min.js'
          script.async = true
          script.onload = () => {
            console.log('VHS module loaded dynamically')
            // After loading, try to initialize VHS again
            const tech = player.tech({ IWillNotUseThisInPlugins: true }) as any
            vhsRef.current =
              tech?.vhs ||
              tech?.hls ||
              (player as any).vhs ||
              (player as any).hls ||
              tech.vhs ||
              tech.hls

            // Update tech info
            setStats((prev) => ({
              ...prev,
              tech: {
                ...prev.tech,
                vhsModuleLoaded: true
              }
            }))
          }
          document.head.appendChild(script)
        }

        // Try to access VHS tech in different ways
        const tech = player.tech({ IWillNotUseThisInPlugins: true }) as any

        // Log tech details for debugging
        console.log('Tech details:', {
          techName: tech?.name_,
          techType: tech?.el_?.type,
          hasVhs: Boolean(tech?.vhs),
          hasHls: Boolean(tech?.hls),
          playerHasVhs: Boolean((player as any).vhs),
          playerHasHls: Boolean((player as any).hls),
          currentSrc: player.currentSrc(),
          isHlsSource: isHls,
          vhsModuleLoaded: isVhsModuleLoaded
        })

        vhsRef.current =
          tech?.vhs ||
          tech?.hls ||
          (player as any).vhs ||
          (player as any).hls ||
          tech.vhs ||
          tech.hls

        // If we still don't have VHS, try to initialize it
        if (!vhsRef.current) {
          console.log('Attempting to initialize VHS tech')
          // This is a last resort attempt to initialize VHS
          const currentSrc = player.currentSrc()
          if (
            currentSrc &&
            (currentSrc.includes('.m3u8') || currentSrc.includes('mux.com'))
          ) {
            // Try to manually initialize VHS by setting the source with the correct type
            player.src({
              src: currentSrc,
              type: 'application/x-mpegURL'
            })

            // Try again after a short delay
            setTimeout(() => {
              const tech = player.tech({
                IWillNotUseThisInPlugins: true
              }) as any

              // Log tech details again after initialization
              console.log('Tech details after initialization:', {
                techName: tech?.name_,
                techType: tech?.el_?.type,
                hasVhs: Boolean(tech?.vhs),
                hasHls: Boolean(tech?.hls),
                playerHasVhs: Boolean((player as any).vhs),
                playerHasHls: Boolean((player as any).hls)
              })

              vhsRef.current =
                tech?.vhs ||
                tech?.hls ||
                (player as any).vhs ||
                (player as any).hls ||
                tech.vhs ||
                tech.hls
            }, 500)
          }
        }
      } catch (error) {
        console.error('Error accessing VHS tech:', error)
      }
    }
  }, [player, isHls, isVhsModuleLoaded])

  const updateStats = () => {
    if (!player) return

    // Access tech with more direct approach
    const tech = player.tech({ IWillNotUseThisInPlugins: true }) as TechWithVhs

    // Try multiple ways to access VHS, including our stored reference
    const vhs =
      vhsRef.current || tech?.vhs || (player as any).vhs || (tech as any).hls

    // Get tech info for debugging
    const techInfo = {
      name: tech?.name_ || '-',
      sourceType: tech?.el_?.type || '-',
      vhsAvailable: Boolean(vhs),
      isHlsSource: isHls,
      vhsModuleLoaded: isVhsModuleLoaded
    }

    // Basic stats available for all players
    const basicStats = {
      currentTime: player.currentTime() || 0,
      duration: player.duration() || 0,
      buffered: formatTimeRanges(player.buffered()),
      seekable: formatTimeRanges(player.seekable()),
      events: eventCountsRef.current
    }

    // Enhanced stats for VHS/HLS
    let enhancedStats = undefined

    if (vhs) {
      // Try to access stats through different paths
      const bandwidth =
        vhs.stats?.bandwidth ||
        vhs.bandwidth ||
        vhs.playlists?.media?.attributes?.BANDWIDTH ||
        0

      const streamBitrate =
        vhs.stats?.streamBitrate || vhs.streamBitrate || vhs.bandwidth || 0

      // Try to access buffer info
      const videoBuffered =
        vhs.stats?.videoBuffered ||
        vhs.videoBuffered ||
        vhs.videoBuffer?.buffered

      const audioBuffered =
        vhs.stats?.audioBuffered ||
        vhs.audioBuffered ||
        vhs.audioBuffer?.buffered

      // Try to access timestamp offsets
      const videoTimestampOffset =
        vhs.sourceUpdater?.videoBuffer?.timestampOffset ||
        vhs.videoTimestampOffset ||
        (vhs.sourceUpdater && vhs.sourceUpdater.videoBuffer?.timestampOffset) ||
        (vhs.videoBuffer && vhs.videoBuffer.timestampOffset) ||
        0

      const audioTimestampOffset =
        vhs.sourceUpdater?.audioBuffer?.timestampOffset ||
        vhs.audioTimestampOffset ||
        (vhs.sourceUpdater && vhs.sourceUpdater.audioBuffer?.timestampOffset) ||
        (vhs.audioBuffer && vhs.audioBuffer.timestampOffset) ||
        0

      enhancedStats = {
        videoBitrate: bandwidth,
        measuredBitrate: streamBitrate,
        videoBuffered: formatTimeRanges(videoBuffered),
        audioBuffered: formatTimeRanges(audioBuffered),
        videoTimestampOffset: videoTimestampOffset,
        audioTimestampOffset: audioTimestampOffset,
        qualityLevels: getQualityLevels(player as PlayerWithQualityLevels, vhs)
      }
    }

    setStats({
      basic: basicStats,
      tech: techInfo,
      enhanced: enhancedStats
    })
  }

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
        <Typography variant="body2">{`${CURRENT_TIME}: ${stats.basic.currentTime.toFixed(2)}`}</Typography>
        <Typography variant="body2">{`${DURATION}: ${stats.basic.duration.toFixed(2)}`}</Typography>
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

      {/* Tech info for debugging */}
      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        {TECH_INFO}
      </Typography>
      <Box>
        <Typography variant="body2">{`${TECH_NAME}: ${stats.tech.name}`}</Typography>
        <Typography variant="body2">{`${SOURCE_TYPE}: ${stats.tech.sourceType}`}</Typography>
        <Typography variant="body2">{`${VHS_AVAILABLE}: ${stats.tech.vhsAvailable ? YES : NO}`}</Typography>
        <Typography variant="body2">{`${HLS_SOURCE}: ${isHls ? YES : NO}`}</Typography>
        <Typography variant="body2">{`${VHS_MODULE_LOADED}: ${stats.tech.vhsModuleLoaded ? YES : NO}`}</Typography>
      </Box>

      {stats.enhanced && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            {ENHANCED_INFO}
          </Typography>
          <Box>
            <Typography variant="body2">{`${VIDEO_BITRATE}: ${(stats.enhanced.videoBitrate / 1000).toFixed(0)} ${KBPS}`}</Typography>
            <Typography variant="body2">{`${MEASURED_BITRATE}: ${(stats.enhanced.measuredBitrate / 1000).toFixed(0)} ${KBPS}`}</Typography>
            <Typography variant="body2">{`${VIDEO_BUFFERED}: ${stats.enhanced.videoBuffered}`}</Typography>
            <Typography variant="body2">{`${AUDIO_BUFFERED}: ${stats.enhanced.audioBuffered}`}</Typography>
            <Typography variant="body2">{`${VIDEO_TIMESTAMP_OFFSET}: ${stats.enhanced.videoTimestampOffset}`}</Typography>
            <Typography variant="body2">{`${AUDIO_TIMESTAMP_OFFSET}: ${stats.enhanced.audioTimestampOffset}`}</Typography>
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            {QUALITY_LEVELS}
          </Typography>
          <Box>
            {stats.enhanced.qualityLevels.length > 0 ? (
              stats.enhanced.qualityLevels.map((level, index) => (
                <Typography variant="body2" key={index}>
                  {`${level.width}x${level.height} @ ${(level.bitrate / 1000).toFixed(0)} ${KBPS} ${level.enabled ? `(${ENABLED})` : `(${DISABLED})`}`}
                </Typography>
              ))
            ) : (
              <Typography variant="body2">{NO_QUALITY_LEVELS}</Typography>
            )}
          </Box>
        </>
      )}
    </Paper>
  )
}

// Helper functions
function formatTimeRanges(ranges: TimeRanges | undefined): string {
  if (!ranges || ranges.length === 0) return '-'

  let result = ''
  for (let i = 0; i < ranges.length; i++) {
    result += `${ranges.start(i).toFixed(2)} - ${ranges.end(i).toFixed(2)} `
  }
  return result
}

function getQualityLevels(player: PlayerWithQualityLevels, vhs?: any) {
  try {
    // Try multiple ways to access quality levels
    const qualityLevels =
      player.qualityLevels?.() ||
      (player as any).tech_?.hls?.representations?.() ||
      (player as any).tech_?.vhs?.representations?.() ||
      []

    // If we have VHS but no quality levels, try to get them from playlists
    if ((!qualityLevels || !qualityLevels.length) && vhs) {
      // Try to access playlists from different paths
      const playlists =
        vhs.playlists?.master?.playlists ||
        vhs.playlists?.master?.playlists ||
        []

      if (playlists.length > 0) {
        return playlists.map((playlist: any, index: number) => {
          const resolution = playlist.attributes?.RESOLUTION || {}
          return {
            id: `playlist-${index}`,
            width: resolution.width || 0,
            height: resolution.height || 0,
            bitrate: playlist.attributes?.BANDWIDTH || 0,
            enabled: playlist.enabled !== false
          }
        })
      }

      // Try to access representations directly
      const representations =
        vhs.representations?.() || vhs.representations?.() || []

      if (representations.length > 0) {
        return representations.map((rep: any, index: number) => {
          return {
            id: rep.id || `rep-${index}`,
            width: rep.width || 0,
            height: rep.height || 0,
            bitrate: rep.bandwidth || 0,
            enabled: rep.enabled !== false
          }
        })
      }

      // Try to access levels directly
      const levels = vhs.levels || vhs.levels || []

      if (levels.length > 0) {
        return levels.map((level: any, index: number) => {
          return {
            id: `level-${index}`,
            width: level.width || 0,
            height: level.height || 0,
            bitrate: level.bitrate || 0,
            enabled: level.enabled !== false
          }
        })
      }
    }

    // Try to get quality levels from the current source
    if (!qualityLevels || !qualityLevels.length) {
      const currentSrc = player.currentSrc()
      if (currentSrc && currentSrc.includes('m3u8')) {
        // For HLS sources, we can at least return a dummy quality level
        return [
          {
            id: 'auto',
            width: 0,
            height: 0,
            bitrate: 0,
            enabled: true
          }
        ]
      }
      return []
    }

    const levels = []
    for (let i = 0; i < qualityLevels.length; i++) {
      levels.push({
        id: qualityLevels[i].id || `level-${i}`,
        width: qualityLevels[i].width || 0,
        height: qualityLevels[i].height || 0,
        bitrate: qualityLevels[i].bitrate || 0,
        enabled: qualityLevels[i].enabled !== false
      })
    }
    return levels
  } catch (error) {
    console.error('Error getting quality levels:', error)
    return []
  }
}
