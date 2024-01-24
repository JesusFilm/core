import { useRouter } from 'next/router'
import { ReactElement, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useLanguagesQuery } from '../../libs/useLanguagesQuery'

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
      ids: [
        // add missing languages
        '20533', // Arabic, Egyptian Colloquial
        '529', // English
        '1106', // Deutsch, German, Standard
        '496', // Français, French
        '584', // Português, Portuguese, Brazil
        '21028', // Español, Spanish, Latin American
        '21754', // 中文, Chinese, Simplified
        '3934', // Русский, Russian
        '1444', // Afrikaans
        '6788', // Farsi, Western
        '6930', // Hebrew
        '6464', // हिन्दी, Hindi
        '16639', // Bahasa Indonesia, Indonesian (Yesus)
        '7083', // 日本語, Japanese
        '3804', // 한국어, Korean
        '9198', // te Reo Māori, Maori
        '1942', // Türkçe, Turkish
        '407', // اُردُو, Urdu
        '3887' // Tiếng Việt, Vietnamese
      ]
    }
  })

  const handleLocaleSwitch = useCallback(
    async (localeId: string | undefined) => {
      let locale = ''
      switch (localeId) {
        case '529':
          locale = 'en'
          break
        case '20533':
          locale = 'ar'
          break
        case '1106':
          locale = 'de'
          break
        case '496':
          locale = 'fr'
          break
        case '584':
          locale = 'pt'
          break
        case '21028':
          locale = 'es'
          break
        case '21754':
          locale = 'zh'
          break
        case '3934':
          locale = 'ru'
          break
        case '1444':
          locale = 'af'
          break
        case '6788':
          locale = 'fa'
          break
        case '6930':
          locale = 'he'
          break
        case '6464':
          locale = 'hi'
          break
        case '16639':
          locale = 'id'
          break
        case '7083':
          locale = 'ja'
          break
        case '3804':
          locale = 'ko'
          break
        case '9198':
          locale = 'mi'
          break
        case '1942':
          locale = 'tr'
          break
        case '407':
          locale = 'ur'
          break
        case '3887':
          locale = 'vi'
          break
        default:
          locale = 'en'
          break
      }

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
