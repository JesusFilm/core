import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next/pages'
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
  /**
   * Optional callback fired when the user clicks the Apply button. When
   * provided, Apply commits the staged language and is responsible for
   * closing this picker (and any parent drawers). When omitted, Apply falls
   * back to onClose so existing flows that only dismiss the picker keep
   * working.
   */
  onApply?: () => void
  language: LanguageOption
  languages?: Language[]
  loading: boolean
  /**
   * Disables the Apply button while the picked language's publish status is
   * still being looked up, mirroring Select's disabled state so Apply can't
   * silently no-op behind the full-screen drawer.
   */
  applyDisabled?: boolean
}

export function VideoLanguage({
  open,
  onClose,
  onChange,
  onApply,
  language,
  languages,
  loading,
  applyDisabled
}: VideoLanguageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const handleApplyClick = (): void => {
    if (onApply != null) {
      onApply()
      return
    }
    onClose()
  }

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
        <Button onClick={handleApplyClick} disabled={applyDisabled}>
          {t('Apply')}
        </Button>
      </Box>
    </Drawer>
  )
}
