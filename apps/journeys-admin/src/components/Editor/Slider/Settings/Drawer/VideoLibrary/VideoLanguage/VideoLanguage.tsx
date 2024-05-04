import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetLanguages_languages as Language } from '../../../../../../../../__generated__/GetLanguages'
import { Drawer } from '../../Drawer'

interface VideoLanguageProps {
  open?: boolean
  onClose: () => void
  onChange: (language: LanguageOption) => void
  language: LanguageOption
  languages?: Language[]
  loading: boolean
}

export function VideoLanguage({
  open,
  onClose,
  onChange,
  language,
  languages,
  loading
}: VideoLanguageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Drawer title={t('Available Languages')} open={open} onClose={onClose}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 6 }}>
        <LanguageAutocomplete
          onChange={onChange}
          value={language}
          languages={languages}
          loading={loading}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3 }}>
        <Button onClick={onClose}>{t('Apply')}</Button>
      </Box>
    </Drawer>
  )
}
