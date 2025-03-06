import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useCallback, useEffect, useState } from 'react'

import VideoJsPlayer from '../utils/videoJsTypes'
import { Html5 } from '../utils/videoJsTypes/Html5'
import { YoutubeTech } from '../utils/videoJsTypes/YoutubeTech'

import {
  calculateBitrate,
  formatTime,
  formatTimeRanges,
  getCurrentQuality,
  getLiveFrameRate
} from './utils/videoStatsUtils'

interface VideoStatsProps {
  player: VideoJsPlayer
  isHls?: boolean
  isYoutube?: boolean
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
    availableQualities?: string[]
    bufferedPercent?: number
  }
}

// Type guards to make our code cleaner
function isYoutubeTech(tech: Html5 | YoutubeTech): tech is YoutubeTech {
  return tech?.name_ === 'Youtube'
}

function isHtml5Tech(tech: Html5 | YoutubeTech): tech is Html5 {
  return tech?.name_ === 'Html5'
}

export function VideoStats({
  player,
  isHls = false,
  isYoutube = false
}: VideoStatsProps) {
  const { t } = useTranslation('libs-journeys-ui')
  const [expandedQualities, setExpandedQualities] = useState(false)

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
    console.log(player)
    if (!player) return

    const basicStats = {
      currentTime: player.currentTime() || 0,
      duration: player.duration() || 0,
      buffered: formatTimeRanges(player.buffered()),
      seekable: formatTimeRanges(player.seekable())
    }

    // Default enhanced stats with hyphens
    let enhancedStats: StatsData['enhanced'] = {
      measuredBitrate: '-' as string | number,
      currentQuality: '-',
      currentFrameRate: '-'
    }

    // Get the tech instance once using the typed method
    const tech = player.tech({ IWillNotUseThisInPlugins: true })

    // Check if this is a YouTube video
    if (isYoutubeTech(tech)) {
      try {
        const ytPlayer = tech.ytPlayer

        // Get YouTube video quality
        const quality = ytPlayer.getPlaybackQuality() || '-'

        // Map YouTube quality strings to resolution
        const qualityMap: Record<string, string> = {
          tiny: '144p',
          small: '240p',
          medium: '360p',
          large: '480p',
          hd720: '720p',
          hd1080: '1080p',
          hd1440: '1440p',
          hd2160: '2160p (4K)',
          highres: '4K+',
          auto: 'Auto',
          default: '-'
        }

        // Get available quality levels
        const availableQualities = ytPlayer.getAvailableQualityLevels() || []
        const mappedQualities = availableQualities.map(
          (q: string) => qualityMap[q] || q
        )

        // Get buffered percentage
        const bufferedPercent = Math.round(
          ytPlayer.getVideoLoadedFraction() * 100
        )

        // Use the quality indicator from YouTube
        const displayQuality = qualityMap[quality] || quality

        enhancedStats = {
          currentQuality: displayQuality,
          bufferedPercent,
          availableQualities: mappedQualities,
          // Keep these properties to maintain interface compatibility
          measuredBitrate: '-',
          currentFrameRate: '-'
        }
      } catch (error) {
        console.error('Error getting YouTube stats:', error)
      }
    } else if (isHtml5Tech(tech)) {
      const vhs = tech.vhs

      if (vhs) {
        // Get bitrate using the utility function
        const calculatedBitrate = calculateBitrate(vhs)
        const liveFrameRate = getLiveFrameRate(player)

        enhancedStats = {
          measuredBitrate: calculatedBitrate || '-',
          currentQuality: getCurrentQuality(player) || '-',
          currentFrameRate: liveFrameRate || '-'
        }
      }
    }

    setStats({
      basic: basicStats,
      enhanced: enhancedStats
    })
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

  const handleQualitiesClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedQualities((prev) => !prev)
  }

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
        {isYoutube ? (
          <>
            <Typography variant="body2">{`${t('Current Quality')}: ${stats.enhanced.currentQuality}`}</Typography>
            <Typography variant="body2">{`${t('Buffered')}: ${stats.enhanced.bufferedPercent}%`}</Typography>

            {stats.enhanced.availableQualities &&
              stats.enhanced.availableQualities.length > 0 && (
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      display: 'inline-block'
                    }}
                    onClick={handleQualitiesClick}
                  >
                    {expandedQualities
                      ? t('Hide Available Qualities')
                      : t('Show Available Qualities')}
                  </Typography>

                  {expandedQualities && (
                    <Box sx={{ ml: 2, mt: 0.5 }}>
                      {stats.enhanced.availableQualities.map(
                        (quality, index) => (
                          <Typography
                            key={index}
                            variant="body2"
                            sx={{ fontSize: '0.8rem' }}
                          >
                            • {quality}
                          </Typography>
                        )
                      )}
                    </Box>
                  )}
                </Box>
              )}
          </>
        ) : (
          <>
            <Typography variant="body2">{`${t('Current Quality')}: ${stats.enhanced.currentQuality}`}</Typography>
            <Typography variant="body2">
              {`${t('Frame Rate')}: ${typeof stats.enhanced.currentFrameRate === 'number' ? `${stats.enhanced.currentFrameRate}${t('fps')}` : stats.enhanced.currentFrameRate}`}
            </Typography>
            <Typography variant="body2">{`${t('Bitrate')}: ${stats.enhanced.measuredBitrate === '-' ? '-' : `${stats.enhanced.measuredBitrate} ${t('kbps')}`}`}</Typography>
          </>
        )}
      </Box>
    </Paper>
  )
}
