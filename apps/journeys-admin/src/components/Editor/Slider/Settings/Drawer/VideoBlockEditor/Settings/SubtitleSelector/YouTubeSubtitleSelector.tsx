import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import type { YouTubeLanguage } from '../VideoBlockEditorSettings'

export interface YouTubeSubtitleSelectorProps {
  selectedSubtitleId: string | null
  availableLanguages: YouTubeLanguage[]
  onChange: (subtitleLanguageId: string | null) => void
  disabled?: boolean
}

export function YouTubeSubtitleSelector({
  selectedSubtitleId,
  availableLanguages,
  onChange,
  disabled = false
}: YouTubeSubtitleSelectorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [searchQuery, setSearchQuery] = useState('')

  const hasNoSubtitles = availableLanguages.length === 0

  const filteredLanguages = useMemo(() => {
    if (searchQuery === '') return availableLanguages

    const lowerQuery = searchQuery.toLowerCase()
    return availableLanguages.filter((language) => {
      const primaryName = language.name?.find((n) => n.primary)?.value ?? ''
      const bcp47 = language.bcp47 ?? ''
      return (
        primaryName.toLowerCase().includes(lowerQuery) ||
        bcp47.toLowerCase().includes(lowerQuery)
      )
    })
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

  const displayValue =
    filteredLanguages.find((language) => language.id === selectedSubtitleId)
      ?.id ?? 'off'

  const getLanguageDisplayName = (language: YouTubeLanguage): string => {
    const primaryName = language.name?.find((n) => n.primary)?.value
    const nonPrimaryName = language.name?.find((n) => !n.primary)?.value

    if (primaryName != null && nonPrimaryName != null) {
      return `${primaryName} (${nonPrimaryName})`
    }

    return primaryName ?? nonPrimaryName ?? language.bcp47 ?? ''
  }

  return (
    <Stack direction="column" spacing={1}>
      <Select
        value={displayValue}
        onChange={handleChange}
        disabled={disabled || hasNoSubtitles}
        variant="filled"
        fullWidth
        displayEmpty
        aria-label={t('Subtitle language selector')}
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
          const selectedLanguage = availableLanguages.find(
            (lang) => lang.id === value
          )
          return selectedLanguage != null
            ? getLanguageDisplayName(selectedLanguage)
            : value
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
              slotProps={{
                htmlInput: {
                  'aria-label': t('Search by language')
                }
              }}
            />
          </Box>
        )}
        <MenuItem value="off">{t('Off')}</MenuItem>
        {filteredLanguages.map((language) => {
          if (language.id == null) return null
          return (
            <MenuItem key={language.id} value={language.id}>
              {getLanguageDisplayName(language)}
            </MenuItem>
          )
        })}
      </Select>
      {hasNoSubtitles && (
        <Typography variant="caption" color="primary.main">
          {t('This video does not have any subtitles')}
        </Typography>
      )}
    </Stack>
  )
}
