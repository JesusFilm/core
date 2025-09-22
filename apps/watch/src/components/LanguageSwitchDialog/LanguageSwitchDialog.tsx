import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { ThemeProvider } from '@mui/material/styles'
import { ReactElement } from 'react'

import { websiteLight } from '@core/shared/ui/themes/website/theme'

import { useWatch } from '../../libs/watchContext'

import { AudioTrackSelect } from './AudioTrackSelect'
import { SubtitlesSelect } from './SubtitlesSelect'

interface LanguageSwitchDialogProps {
  open?: boolean
  handleClose?: () => void
}

export function LanguageSwitchDialog({
  open,
  handleClose
}: LanguageSwitchDialogProps): ReactElement {
  const {
    state: {
      videoAudioLanguageIds,
      videoSubtitleLanguageIds,
      audioLanguageId,
      subtitleLanguageId,
      subtitleOn
    }
  } = useWatch()
  return (
    <ThemeProvider theme={websiteLight}>
      <Dialog
        open={open || false}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-label="Language Settings"
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleClose}
            size="small"
            aria-label="Close dialog"
            sx={{ m: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 0, pb: 6, px: 0 }}>
          <Stack gap={8}>
            <AudioTrackSelect
              videoAudioLanguageIds={videoAudioLanguageIds}
              audioLanguageId={audioLanguageId}
            />
            <SubtitlesSelect
              videoSubtitleLanguageIds={videoSubtitleLanguageIds}
              subtitleLanguageId={subtitleLanguageId}
              subtitleOn={subtitleOn}
            />
          </Stack>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  )
}
