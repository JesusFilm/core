import { TranslationStatus } from '@crowdin/crowdin-api-client'
import { useRouter } from 'next/router'
import { i18n } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'
import { Button, Typography } from '@mui/material'

import { GetLanguages_languages as Language } from '../../../__generated__/GetLanguages'
import { useLanguagesQuery } from '../../libs/useLanguagesQuery'
import { getLocaleLanguage } from '../../libs/getLocaleLanguage'

interface DefaultLanguage {
  id: string
  nativeName?: string
  localName?: string
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
  const { t } = useTranslation('apps-journeys-admin')

  const [languageData, setLanguageData] = useState<Language[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>()
  const [prevLanguageId, setPrevLanguageId] = useState<string>()
  const [confirmLanguageChange, setConfirmLanguageChange] = useState(false)

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
      nativeName: language?.name.find(({ primary }) => primary)?.value,
      localName: language?.name.find(({ primary }) => !primary)?.value
    }
  }

  useEffect(() => {
    const translationStatus = new TranslationStatus({
      token: process.env.NEXT_PUBLIC_CROWDIN_ACCESS_TOKEN ?? ''
    })

    if (data != null) {
      setCurrentLanguage(getCurrentLanguage())

      translationStatus
        .getFileProgress(518286, 570)
        .then((crowdinData) => {
          const availableLanguages = data.languages.filter((language) => {
            const crowdinLocale = getLocaleLanguage('id', language.id)?.locale
            const crowdinLanguageData = crowdinData.data.find(
              (crowdinLanguage) =>
                crowdinLanguage.data.language.locale === crowdinLocale
            )
            return (
              // always display English
              language.id === '529' ||
              crowdinLanguageData?.data.approvalProgress === 100
            )
          })

          setLanguageData(availableLanguages)
        })
        .catch((error) => console.error(error))
    }
  }, [data])

  const handleLocaleSwitch = useCallback(
    (localeId: string | undefined) => {
      if (currentLanguage != null) setPrevLanguageId(currentLanguage.id)

      const language = data?.languages.find(
        (language) => language.id === localeId
      )

      const locale = getLocaleLanguage('id', language?.id ?? '')?.locale

      const path = router.asPath
      void router.push(path, path, { locale })

      setConfirmLanguageChange(true)
    },
    [router, data, currentLanguage]
  )

  function revertToPreviousLanguage() {
    handleLocaleSwitch(prevLanguageId)
    handleClose()
  }

  return (
    <>
      {confirmLanguageChange ? (
        <Dialog
          open={open}
          onClose={handleClose}
          dialogTitle={{
            title: t('Confirm Language Change'),
            closeButton: true
          }}
        >
          <Typography>
            {t('Are you sure you want to change language?')}
          </Typography>
          <Button onClick={() => handleClose()}>{t('Yes')}</Button>
          <Button onClick={() => revertToPreviousLanguage()}>{t('No')}</Button>
        </Dialog>
      ) : (
        <Dialog
          open={open}
          onClose={handleClose}
          dialogTitle={{
            title: t('Change Language'),
            closeButton: true
          }}
        >
          <LanguageAutocomplete
            onChange={(value) => handleLocaleSwitch(value?.id)}
            value={
              currentLanguage != null
                ? currentLanguage
                : { id: '', nativeName: '', localName: '' }
            }
            languages={languageData}
            loading={loading}
          />
        </Dialog>
      )}
    </>
  )
}
