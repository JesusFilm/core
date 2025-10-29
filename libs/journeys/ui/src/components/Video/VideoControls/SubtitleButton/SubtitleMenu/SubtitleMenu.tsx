import CheckIcon from '@mui/icons-material/Check'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface SubtitleMenuProps {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  youtubeCaptionTracks: TextTrack[]
  activeYoutubeTrack: TextTrack | undefined
  onChange: (trackId: string | null) => void
}

export function SubtitleMenu({
  anchorEl,
  open,
  onClose,
  youtubeCaptionTracks,
  activeYoutubeTrack,
  onChange
}: SubtitleMenuProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  function handleToggleSubtitle(trackId: string | null): void {
    onChange(trackId)
    onClose()
  }

  const hasSubtitles = youtubeCaptionTracks.length > 0

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
        {!hasSubtitles && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
      </MenuItem>
      {!hasSubtitles && (
        <MenuItem disabled>{t('No subtitles available')}</MenuItem>
      )}
      {youtubeCaptionTracks.length > 0 &&
        youtubeCaptionTracks.map(
          (track) =>
            track.label != null && (
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
                {track.label}
                {activeYoutubeTrack?.id === track.id && (
                  <CheckIcon fontSize="small" sx={{ ml: 1 }} />
                )}
              </MenuItem>
            )
        )}
    </Menu>
  )
}
