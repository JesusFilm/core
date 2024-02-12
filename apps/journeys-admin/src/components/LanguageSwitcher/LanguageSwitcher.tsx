import { TranslationStatus } from '@crowdin/crowdin-api-client'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetLanguages_languages as Language } from '../../../__generated__/GetLanguages'
import { getLocaleLanguage } from '../../libs/getLocaleLanguage'
import { useLanguagesQuery } from '../../libs/useLanguagesQuery'

interface languageState {
  confirmLanguageChange: boolean
  prevLanguageId?: string
}

interface LanguageSwitcherProps {
  open: boolean
  handleClose: () => void
}

export function LanguageSwitcher({
  open,
  handleClose
}: LanguageSwitcherProps): ReactElement {
  const router = useRouter()
  const { t, i18n } = useTranslation('apps-journeys-admin')

  const [languages, setLanguages] = useState<Language[]>([])
  const [languageState, setLanguageState] = useState<languageState>({
    confirmLanguageChange: false,
    prevLanguageId: undefined
  })

  const { data, loading } = useLanguagesQuery({
    languageId: '529'
  })

  function getCurrentLanguage(): LanguageOption {
    const currentLocale = getLocaleLanguage('locale', i18n?.language ?? '')
    const language = data?.languages.find(
      (language) => language.id === currentLocale?.id
    )
    return {
      id: language?.id ?? '',
      nativeName: language?.name.find(({ primary }) => !primary)?.value,
      localName: language?.name.find(({ primary }) => primary)?.value
    }
  }
  const currentLanguage = getCurrentLanguage()

  const handleLocaleSwitch = useCallback(
    (localeId: string | undefined) => {
      if (currentLanguage != null)
        setLanguageState({
          confirmLanguageChange: true,
          prevLanguageId: currentLanguage.id
        })
      const language = data?.languages.find(
        (language) => language.id === localeId
      )
      const locale = getLocaleLanguage('id', language?.id ?? '')?.twoLettersCode

      const cookieFingerprint = '00001'
      document.cookie = `NEXT_LOCALE=${cookieFingerprint}-${locale}; path=/`
      const path = router.asPath
      void router.push(path, path, { locale })
    },
    [router, data, currentLanguage]
  )

  function handleCancelLanguageChange(): void {
    const { prevLanguageId } = languageState
    handleLocaleSwitch(prevLanguageId)
    handleClose()
  }

  function getPreviousLanguage(): string {
    const { prevLanguageId } = languageState
    let prevLanguage
    if (prevLanguageId != null)
      prevLanguage = getLocaleLanguage('id', prevLanguageId)?.locale
    return prevLanguage ?? i18n.language
  }

  function filterAvailableLanguages(languages, crowdinData): Language[] {
    return languages.filter((language) => {
      const crowdinLocale = getLocaleLanguage('id', language.id)?.locale
      const crowdinLanguages = crowdinData.data.find(
        (crowdinLanguage) =>
          crowdinLanguage.data.language.locale === crowdinLocale
      )
      return (
        (language.id === '529' || // always display English
          crowdinLanguages?.data.translationProgress === 100) &&
        language.id !== '22658' // show arabic as an option when RTL working
      )
    })
  }

  useEffect(() => {
    const translationStatus = new TranslationStatus({
      token: process.env.NEXT_PUBLIC_CROWDIN_ACCESS_TOKEN ?? ''
    })

    if (data != null) {
      translationStatus
        .getFileProgress(518286, 570)
        .then((crowdinData) => {
          const availableLanguages = filterAvailableLanguages(
            data.languages,
            crowdinData
          )
          setLanguages(availableLanguages)
        })
        .catch((error) => console.error(error))
    }
  }, [data])

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        dialogTitle={{
          title: t('Change Language', {
            lng: getPreviousLanguage()
          }),
          closeButton: true
        }}
      >
        <Stack gap={2}>
          <LanguageAutocomplete
            onChange={(value) => handleLocaleSwitch(value?.id)}
            value={currentLanguage}
            languages={languages}
            loading={loading || languages.length === 0}
          />
          {languageState.confirmLanguageChange && (
            <Alert
              severity="warning"
              action={
                <Button
                  onClick={handleCancelLanguageChange}
                  color="inherit"
                  size="small"
                >
                  {t('Revert', {
                    lng: getPreviousLanguage()
                  })}
                </Button>
              }
            >
              {t('Are you sure you want to change language?', {
                lng: getPreviousLanguage()
              })}
            </Alert>
          )}
        </Stack>
      </Dialog>
    </>
  )
}
