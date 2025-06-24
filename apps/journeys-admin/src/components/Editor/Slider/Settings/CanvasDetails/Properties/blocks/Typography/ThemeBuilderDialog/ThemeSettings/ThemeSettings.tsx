import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface ThemeSettingsProps {
  onHeaderFontChange: (font: string) => void
  onBodyFontChange: (font: string) => void
  onLabelsFontChange: (font: string) => void
  headerFont: string
  bodyFont: string
  labelsFont: string
}

export function ThemeSettings({
  onHeaderFontChange,
  onBodyFontChange,
  onLabelsFontChange,
  headerFont,
  bodyFont,
  labelsFont
}: ThemeSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  // Mock font options - replace with actual font options from your system
  const fontOptions = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Roboto',
    'Open Sans'
  ]

  return (
    <Stack spacing={4} sx={{ width: '100%' }}>
      <Stack spacing={1}>
        <TextField
          select
          fullWidth
          hiddenLabel
          value={headerFont}
          helperText={t(
            'Used for large text elements like titles and headings.'
          )}
          onChange={(e) => onHeaderFontChange(e.target.value)}
        >
          {fontOptions.map((font) => (
            <MenuItem key={font} value={font}>
              {font}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Stack spacing={1}>
        <TextField
          select
          fullWidth
          hiddenLabel
          value={bodyFont}
          helperText={t(
            'Used for paragraphs, subheadings, and smaller content.'
          )}
          onChange={(e) => onBodyFontChange(e.target.value)}
        >
          {fontOptions.map((font) => (
            <MenuItem key={font} value={font}>
              {font}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Stack spacing={1}>
        <TextField
          select
          fullWidth
          hiddenLabel
          value={labelsFont}
          helperText={t('Used for buttons, forms, and interface elements.')}
          onChange={(e) => onLabelsFontChange(e.target.value)}
        >
          {fontOptions.map((font) => (
            <MenuItem key={font} value={font}>
              {font}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    </Stack>
  )
}
