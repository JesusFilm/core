import { useRouter } from 'next/router'
import { ReactElement, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useLanguagesQuery } from '../../libs/useLanguagesQuery'

import { languages } from './languageData'

interface LanguageSelectorProps {
  open: boolean
  onClose: () => void
}

export function LanguageSelector({
  open,
  onClose
}: LanguageSelectorProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')

  const { data, loading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: languages.map((language) => {
        return language.id
      })
    }
  })

  const handleLocaleSwitch = useCallback(
    async (localeId: string | undefined) => {
      const locale = languages.find((l) => l.id === localeId)?.bcp47.slice(0, 2)

      const path = router.asPath
      return await router.push(path, path, { locale })
    },
    [router]
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: t('Change Language'),
        closeButton: true
      }}
    >
      <LanguageAutocomplete
        onChange={async (value) => await handleLocaleSwitch(value?.id)}
        // need to add value
        languages={data?.languages}
        loading={loading}
      />
    </Dialog>
  )
}
