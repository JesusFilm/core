import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

interface TranslateJourneyDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Function to close the dialog */
  onClose: () => void
  /** Journey ID to translate */
  journeyId: string
}

/**
 * Dialog for translating a journey's content to a different language.
 * Allows selection of video and text language for the translated journey.
 */
export function TranslateJourneyDialog({
  open,
  onClose,
  journeyId
}: TranslateJourneyDialogProps): ReactElement {
  console.log('Dialog Render - Component Mounting/Updating', {
    open,
    journeyId
  })

  useEffect(() => {
    console.log('Dialog - Effect Running', { open })
    return () => {
      console.log('Dialog - Component Unmounting')
    }
  }, [open])

  const { t } = useTranslation('apps-journeys-admin')

  // TODO: These will eventually come from an API or config
  const availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'French (Français)' },
    { code: 'de', label: 'German (Deutsch)' }
  ]

  // State for language selections
  const [videoLanguage, setVideoLanguage] = useState('')
  const [textLanguage, setTextLanguage] = useState('')

  // Handlers for language selection changes
  const handleVideoLanguageChange = (event: SelectChangeEvent): void => {
    console.log('Video Language Change:', event.target.value)
    setVideoLanguage(event.target.value)
  }

  const handleTextLanguageChange = (event: SelectChangeEvent): void => {
    console.log('Text Language Change:', event.target.value)
    setTextLanguage(event.target.value)
  }

  // Handler for translation submission
  const handleTranslate = async (): Promise<void> => {
    console.log('Translate Button Click - Start', { open, journeyId })
    try {
      // TODO: Translation mutation will go here
      onClose()
    } catch (error) {
      // TODO: Error handling
    }
    console.log('Translate Button Click - End')
  }

  const handleDialogClose = (): void => {
    console.log('Dialog Close Event Triggered', { open, journeyId })
    console.log('Dialog State before close:', { videoLanguage, textLanguage })
    onClose()
  }

  const element = (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      aria-labelledby="translate-journey-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="translate-journey-title">
        {t('Translate Journey')}
      </DialogTitle>
      <DialogContent>
        {/* Text Language Selection */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="text-language-label">{t('Text Language')}</InputLabel>
          <Select
            labelId="text-language-label"
            value={textLanguage}
            label={t('Text Language')}
            onChange={handleTextLanguageChange}
          >
            {availableLanguages.map(({ code, label }) => (
              <MenuItem key={code} value={code}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Video Language Selection */}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="video-language-label">
            {t('Video Language')}
          </InputLabel>
          <Select
            labelId="video-language-label"
            value={videoLanguage}
            label={t('Video Language')}
            onChange={handleVideoLanguageChange}
          >
            {availableLanguages.map(({ code, label }) => (
              <MenuItem key={code} value={code}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>{t('Cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleTranslate}
          disabled={!videoLanguage || !textLanguage}
        >
          {t('Translate')}
        </Button>
      </DialogActions>
    </Dialog>
  )

  console.log('Dialog Return - Element being rendered', {
    open,
    hasContent: element != null
  })
  return element
}
