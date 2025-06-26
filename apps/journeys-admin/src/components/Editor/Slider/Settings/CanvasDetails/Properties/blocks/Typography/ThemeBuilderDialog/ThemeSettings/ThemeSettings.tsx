import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import Header1Icon from '@core/shared/ui/icons/Header1'
import Type2Icon from '@core/shared/ui/icons/Type2'
import Type3Icon from '@core/shared/ui/icons/Type3'

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
    <Stack spacing={4} sx={{ minHeight: 860, minWidth: 380 }}>
      <Stack spacing={1}>
        <TextField
          select
          fullWidth
          variant="filled"
          label={t('Header Text')}
          value={headerFont}
          helperText={t(
            'Used for large text elements like titles and headings.'
          )}
          onChange={(e) => onHeaderFontChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Header1Icon />
                </InputAdornment>
              )
            }
          }}
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
          variant="filled"
          label={t('Body Text')}
          value={bodyFont}
          helperText={t(
            'Used for paragraphs, subheadings, and smaller content.'
          )}
          onChange={(e) => onBodyFontChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Type2Icon />
                </InputAdornment>
              )
            }
          }}
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
          variant="filled"
          label={t('Label Text')}
          value={labelsFont}
          helperText={t('Used for buttons, forms, and interface elements.')}
          onChange={(e) => onLabelsFontChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Type3Icon />
                </InputAdornment>
              )
            }
          }}
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
