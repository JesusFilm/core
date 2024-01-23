import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { ReactElement, useCallback } from 'react'

import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useLanguagesQuery } from '../../libs/useLanguagesQuery'

export function LanguageSelector(): ReactElement {
  const router = useRouter()

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
        '20615', // 普通話, Chinese, Mandarin
        '3934' // Русский, Russian
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
        case '20615':
          locale = 'zh'
          break
        case '3934':
          locale = 'ru'
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
    <Box sx={{ width: '400px', m: 5 }}>
      <LanguageAutocomplete
        onChange={async (value) => await handleLocaleSwitch(value?.id)}
        // need to add value
        languages={data?.languages}
        loading={loading}
      />
    </Box>
  )
}
