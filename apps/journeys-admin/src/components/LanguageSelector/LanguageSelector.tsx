import { TranslationStatus } from '@crowdin/crowdin-api-client'
import { useRouter } from 'next/router'
import { i18n } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { GetLanguages_languages as Language } from '../../../__generated__/GetLanguages'
import {
  getLanguageById,
  getLanguageByLocale
} from '../../libs/languageData/languageData'
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
  const {
    t,
    i18n: { dir }
  } = useTranslation('apps-journeys-admin')

  const [languageData, setLanguageData] = useState<Language[]>([])

  const { data, loading } = useLanguagesQuery({
    languageId: '529'
  })

  useEffect(() => {
    const translationStatus = new TranslationStatus(credentials)

    if (data !== undefined) {
      translationStatus
        .getFileProgress(518286, 570)
        .then((crowdinData) => {
          const availableLanguages = data.languages.filter((language) => {
            const crowdinId = getLanguageById(language.id)?.crowdinId
            const crowdinLanguageData = crowdinData.data.find(
              (crowdinLanguage) => crowdinLanguage.data.languageId === crowdinId
            )
            return (
              // always display English
              language.id === '529' ||
              language.id === '22658' || // Arabic for rtl testing purposes
              crowdinLanguageData?.data.approvalProgress === 100
            )
          })

          setLanguageData(availableLanguages)
        })
        .catch((error) => console.error(error))
    }
  }, [data])

  const handleLocaleSwitch = useCallback(
    async (localeId: string | undefined) => {
      const language = data?.languages.find(
        (language) => language.id === localeId
      )
      const locale = getLanguageById(language?.id ?? '')?.locale

      const path = router.asPath
      await router.push(path, path, { locale })
      document.dir = dir()
    },
    [router, data, dir]
  )

  const currentLanguage = getLanguageByLocale(i18n?.language ?? '')
  const defaultLanguageValue = {
    id: currentLanguage?.id ?? '',
    nativeName: currentLanguage?.name[0].value,
    localName: currentLanguage?.name[1]?.value
  }

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
        value={defaultLanguageValue}
        languages={languageData}
        loading={loading}
      />
    </Dialog>
  )
}
