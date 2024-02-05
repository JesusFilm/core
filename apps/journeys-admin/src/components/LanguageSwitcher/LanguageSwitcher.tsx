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

  const placeholderLanguage = { id: '', nativeName: '', localName: '' }
  const [languageData, setLanguageData] = useState<Language[]>([])
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
      const locale = getLocaleLanguage('id', language?.id ?? '')?.locale
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
      const crowdinLanguageData = crowdinData.data.find(
        (crowdinLanguage) =>
          crowdinLanguage.data.language.locale === crowdinLocale
      )
      return (
        // always display English
        language.id === '529' ||
        crowdinLanguageData?.data.translationProgress === 100
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
          setLanguageData(availableLanguages)
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
            value={
              currentLanguage != null ? currentLanguage : placeholderLanguage
            }
            languages={languageData}
            loading={loading}
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
