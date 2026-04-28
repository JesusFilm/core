import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetLanguages_languages as Language } from '../../../../../../../../__generated__/GetLanguages'

export interface VideoLanguagePickerProps {
  onChange: (language: LanguageOption) => void
  language: LanguageOption
  languages?: Language[]
  loading: boolean
}

export function VideoLanguagePicker({
  onChange,
  language,
  languages,
  loading
}: VideoLanguagePickerProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box
      sx={{ p: 4, width: { xs: 280, sm: 360 } }}
      data-testid="VideoLanguagePicker"
    >
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {t('Available Languages')}
      </Typography>
      <LanguageAutocomplete
        onChange={onChange}
        value={language}
        languages={languages}
        loading={loading}
      />
    </Box>
  )
}
