import Subtitles from '@mui/icons-material/Subtitles'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import VideoJsPlayer from '../../utils/videoJsTypes'
import { getCaptionsAndSubtitleTracks } from '../../utils/getCaptionsAndSubtitleTracks'
import { hideAllSubtitles } from '../../utils/hideAllSubtitles'
import { getYouTubePlayer } from '../../utils/getYouTubePlayer'
import { setYouTubeCaptionTrack } from '../../utils/setYouTubeCaptionTrack'
import { unloadYouTubeCaptions } from '../../utils/unloadYouTubeCaptions'

import { SubtitleMenu } from './SubtitleMenu/SubtitleMenu'

interface SubtitleButtonProps {
  player: VideoJsPlayer
  source: VideoBlockSource
}

export function SubtitleButton({
  player,
  source
}: SubtitleButtonProps): ReactElement {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleClick(event: React.MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(): void {
    setAnchorEl(null)
  }

  function handleSubtitleChange(trackId: string | null): void {
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
            break
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
  }

  const open = Boolean(anchorEl)

  // Get caption tracks and determine button state
  const youtubeCaptionTracks = getCaptionsAndSubtitleTracks(player)
  const activeYoutubeTrack = youtubeCaptionTracks.find(
    (track) => track.mode === 'showing'
  )

  // Determine button state based on available tracks and active track
  const hasAvailableTracks = youtubeCaptionTracks.length > 0
  const isTrackSelected = youtubeCaptionTracks != null
  const isDisabled = !hasAvailableTracks

  return (
    <>
      <IconButton
        aria-label="subtitles"
        aria-controls="subtitle-menu"
        aria-expanded={open}
        aria-haspopup={open}
        onClick={handleClick}
        disabled={isDisabled}
        sx={{
          color: isDisabled ? 'text.disabled' : 'common.white',
          position: 'relative',
          '&:hover': {
            backgroundColor: isDisabled ? 'transparent' : 'action.hover'
          },
          // Add red underline when track is selected
          '&::after': isTrackSelected
            ? {
                content: '""',
                position: 'absolute',
                bottom: 5,
                width: '50%',
                height: 2,
                backgroundColor: 'error.main',
                borderRadius: '2px'
              }
            : {}
        }}
      >
        <Subtitles />
      </IconButton>
      <SubtitleMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        youtubeCaptionTracks={youtubeCaptionTracks}
        activeYoutubeTrack={activeYoutubeTrack}
        onChange={handleSubtitleChange}
      />
    </>
  )
}
