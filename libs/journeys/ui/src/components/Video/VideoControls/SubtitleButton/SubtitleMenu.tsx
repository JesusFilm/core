import CheckIcon from '@mui/icons-material/Check'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import VideoJsPlayer from '../../utils/videoJsTypes'
import { isYoutubeTech } from '../../utils/videoStatsUtils/isYoutubeTech'

interface SubtitleMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  player: VideoJsPlayer
  source: VideoBlockSource
}

export function SubtitleMenu({
  anchorEl,
  open,
  onClose,
  player,
  source
}: SubtitleMenuProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  function handleToggleSubtitle(trackId: string | null): void {
    const tech = player.tech()

    // Handle YouTube videos
    if (source === VideoBlockSource.youTube && isYoutubeTech(tech)) {
      const ytPlayer = tech.ytPlayer

      if (trackId == null) {
        // set track mode to hidden for all subtitles and captions
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i]
          if (track.kind === 'subtitles' || track.kind === 'captions') {
            track.mode = 'hidden'
          }
        }
        // Turn off captions for YouTube
        ytPlayer?.unloadModule?.('captions')
      } else {
        // Get the track info to find the language code
        const tracks = player.textTracks?.() ?? new TextTrackList()

        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i]
          if (track.id === trackId) {
            track.mode = 'showing'
            // Activate captions with the specific language
            ytPlayer?.loadModule?.('captions')
            ytPlayer?.setOption?.('captions', 'track', {
              languageCode: track.language
            })
          } else {
            track.mode = 'hidden'
          }
        }
      }
    } else {
      // Handle HTML5/normal videos
      const tracks = player.textTracks?.() ?? new TextTrackList()

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        if (trackId == null) {
          // Turn off all subtitles
          if (track.kind === 'subtitles' || track.kind === 'captions') {
            track.mode = 'hidden'
          }
        } else if (track.id === trackId) {
          track.mode = track.mode === 'showing' ? 'hidden' : 'showing'
        } else if (track.kind === 'subtitles' || track.kind === 'captions') {
          track.mode = 'hidden'
        }
      }
    }

    onClose()
  }

  const tracks = player.textTracks?.() ?? new TextTrackList()
  const captionTracks: TextTrack[] = []

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    if (track.kind === 'subtitles' || track.kind === 'captions') {
      captionTracks.push(track)
    }
  }

  const activeTrack = captionTracks.find((track) => track.mode === 'showing')

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
    >
      <MenuItem
        onClick={() => handleToggleSubtitle(null)}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minWidth: 150
        }}
      >
        {t('Off')}
        {activeTrack == null && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
      </MenuItem>
      {captionTracks.length === 0 ? (
        <MenuItem disabled>{t('No subtitles available')}</MenuItem>
      ) : (
        captionTracks.map((track) => (
          <MenuItem
            key={track.id}
            onClick={() => handleToggleSubtitle(track.id)}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minWidth: 150
            }}
          >
            {track.label ?? track.language ?? 'Unknown'}
            {activeTrack?.id === track.id && (
              <CheckIcon fontSize="small" sx={{ ml: 1 }} />
            )}
          </MenuItem>
        ))
      )}
    </Menu>
  )
}
