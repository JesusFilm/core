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

  const { data, loading } = useLanguagesQuery({
    languageId: '529'
  })

  function getCrowdinId(languageId: string): string {
    let crowdinId = ''
    switch (languageId) {
      case '1106':
        crowdinId = 'de'
        break
      case '16639':
        crowdinId = 'id'
        break
      case '1942':
        crowdinId = 'tr'
        break
      case '21028':
        crowdinId = 'es-ES'
        break
      case '21753':
        crowdinId = 'zh-TW'
        break
      case '21754':
        crowdinId = 'zh-CN'
        break
      case '22658':
        crowdinId = 'ar'
        break
      case '3804':
        crowdinId = 'ko'
        break
      case '3887':
        crowdinId = 'vi'
        break
      case '3934':
        crowdinId = 'ru'
        break
      case '407':
        crowdinId = 'ur-PK'
        break
      case '496':
        crowdinId = 'fr'
        break
      case '584':
        crowdinId = 'pt-PT'
        break
      case '6464':
        crowdinId = 'hi'
        break
      case '6788':
        crowdinId = 'fa'
        break
      case '6930':
        crowdinId = 'he'
        break
      case '7083':
        crowdinId = 'ja'
        break
    }
    return crowdinId
  }

  useEffect(() => {
    const translationStatus = new TranslationStatus(credentials)

    if (data !== undefined) {
      translationStatus
        .getProjectProgress(518286)
        .then((crowdinData) => {
          console.log(crowdinData)
          const availableLanguages = data.languages.filter((l) => {
            const crowdinId = getCrowdinId(l.id)
            const crowdinLanguageData = crowdinData.data.find(
              (cl) => cl.data.languageId === crowdinId
            )
            return (
              // always display English
              l.id === '529' ||
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
