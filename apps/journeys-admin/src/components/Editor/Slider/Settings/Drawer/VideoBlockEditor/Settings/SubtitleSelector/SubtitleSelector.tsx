import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

export interface SubtitleSelectorProps {
  selectedSubtitle: string | null
  availableLanguages: string[]
  onChange: (subtitle: string | null) => void
  disabled?: boolean
}

export function SubtitleSelector({
  selectedSubtitle,
  availableLanguages,
  onChange,
  disabled = false
}: SubtitleSelectorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [searchQuery, setSearchQuery] = useState('')

  const hasNoSubtitles = availableLanguages.length === 0

  const filteredLanguages = useMemo(() => {
    if (searchQuery === '') return availableLanguages

    return availableLanguages.filter((language) =>
      language.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [availableLanguages, searchQuery])

  const handleChange = (event: SelectChangeEvent<string>): void => {
    const value = event.target.value
    onChange(value === 'off' ? null : value)
    setSearchQuery('')
  }

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setSearchQuery(event.target.value)
  }

  const displayValue = selectedSubtitle ?? 'off'

  return (
    <Stack direction="column" spacing={1}>
      <Select
        value={displayValue}
        onChange={handleChange}
        disabled={disabled || hasNoSubtitles}
        variant="filled"
        fullWidth
        displayEmpty
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '16px 12px',
            lineHeight: '1.1875em'
          },
          '& .MuiFilledInput-input': {
            padding: '16px 12px',
            display: 'flex',
            alignItems: 'center'
          },
          '& .MuiFilledInput-root': {
            alignItems: 'stretch'
          }
        }}
        renderValue={(value) => {
          if (value === 'off') {
            return t('Off')
          }
          return value
        }}
        MenuProps={{
          autoFocus: false,
          PaperProps: {
            sx: {
              maxHeight: 400
            }
          }
        }}
      >
        {!hasNoSubtitles && (
          <Box
            sx={{
              px: 2,
              py: 1,
              position: 'sticky',
              top: 0,
              bgcolor: 'background.paper',
              zIndex: 1
            }}
          >
            <TextField
              size="small"
              placeholder={t('Search by language')}
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              fullWidth
              autoFocus
            />
          </Box>
        )}
        <MenuItem value="off">{t('Off')}</MenuItem>
        {filteredLanguages.map((language) => (
          <MenuItem key={language} value={language}>
            {language}
          </MenuItem>
        ))}
      </Select>
      {hasNoSubtitles && (
        <Typography variant="caption" color="action.disabled">
          {t('This video does not have any subtitles')}
        </Typography>
      )}
    </Stack>
  )
}
