import { TranslationStatus } from '@crowdin/crowdin-api-client'
import { useRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { GetLanguages_languages as Language } from '../../../__generated__/GetLanguages'
import { useLanguagesQuery } from '../../libs/useLanguagesQuery'

interface LanguageSelectorProps {
  open: boolean
  onClose: () => void
}

const credentials = {
  token: process.env.NEXT_PUBLIC_CROWDIN_ACCESS_TOKEN ?? ''
}

export function LanguageSelector({
  open,
  onClose
}: LanguageSelectorProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')

  const [languageData, setLanguageData] = useState<Language[]>([])

  console.log(languageData)

  const { data, loading } = useLanguagesQuery({
    languageId: '529'
  })

  useEffect(() => {
    const translationStatus = new TranslationStatus(credentials)

    if (data !== undefined) {
      translationStatus
        .getProjectProgress(518286)
        .then((r) => {
          const availableLanguages = data.languages.filter((l) => {
            const crowdinLanguageData = r.data.find(
              // need a better way to do this check - not sure it's always the same.
              (cl) => cl.data.language.osxLocale.toLowerCase() === l.bcp47
            )
            return crowdinLanguageData?.data.approvalProgress === 0
          })

          setLanguageData(availableLanguages)
        })
        .catch((error) => console.error(error))
    }
  }, [data])

  const handleLocaleSwitch = useCallback(
    async (localeId: string | undefined) => {
      const language = data?.languages.find((l) => l.id === localeId)
      const locale = language?.bcp47?.slice(0, 2)

      const path = router.asPath
      return await router.push(path, path, { locale })
    },
    [router, data?.languages]
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
        languages={languageData}
        loading={loading}
      />
    </Dialog>
  )
}
