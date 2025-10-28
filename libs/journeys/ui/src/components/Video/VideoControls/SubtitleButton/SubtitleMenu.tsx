import CheckIcon from '@mui/icons-material/Check'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import VideoJsPlayer from '../../utils/videoJsTypes'
import { hideAllSubtitles } from '../../utils/hideAllSubtitles'
import { getYouTubePlayer } from '../../utils/getYouTubePlayer'
import { setYouTubeCaptionTrack } from '../../utils/setYouTubeCaptionTrack'
import { unloadYouTubeCaptions } from '../../utils/unloadYouTubeCaptions'

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
    // first hide all subtitles
    hideAllSubtitles(player)
    const ytPlayer = getYouTubePlayer(player)

    // Handle YouTube videos
    if (source === VideoBlockSource.youTube) {
      if (trackId == null) {
        unloadYouTubeCaptions(ytPlayer)
      } else {
        // Get the track info to find the language code
        const tracks = player.textTracks?.() ?? new TextTrackList()

        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i]
          if (track.id === trackId) {
            track.mode = 'showing'
            setYouTubeCaptionTrack(ytPlayer, track.language)
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
        if (track.id === trackId) {
          track.mode = track.mode === 'showing' ? 'hidden' : 'showing'
          break
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
