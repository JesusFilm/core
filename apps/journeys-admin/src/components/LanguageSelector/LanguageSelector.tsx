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
import { Button, Typography } from '@mui/material'

interface DefaultLanguage {
  id: string
  nativeName?: string
  localName?: string
}
interface LanguageSelectorProps {
  open: boolean
  handleClose: () => void
}

const credentials = {
  token: process.env.NEXT_PUBLIC_CROWDIN_ACCESS_TOKEN ?? ''
}

export function LanguageSelector({
  open,
  handleClose
}: LanguageSelectorProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')

  const [languageData, setLanguageData] = useState<Language[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<DefaultLanguage>()
  const [prevLanguageId, setPrevLanguageId] = useState('')
  const [confirmLanguageChange, setConfirmLanguageChange] = useState(false)

  const { data, loading } = useLanguagesQuery({
    languageId: '529'
  })

  useEffect(() => {
    const currentLanguage = getLanguageByLocale(i18n?.language ?? '')
    setCurrentLanguage({
      id: currentLanguage?.id ?? '',
      nativeName: currentLanguage?.name[0].value,
      localName: currentLanguage?.name[1]?.value
    })

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
      setPrevLanguageId(currentLanguage?.id ?? '')
      const language = data?.languages.find(
        (language) => language.id === localeId
      )
      const locale = getLanguageById(language?.id ?? '')?.locale

      const path = router.asPath
      await router.push(path, path, { locale })

      setConfirmLanguageChange(true)
    },
    [router, data]
  )

  async function revertToPreviousLanguage() {
    await handleLocaleSwitch(prevLanguageId)
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
          <Button onClick={async () => await revertToPreviousLanguage()}>
            {t('No')}
          </Button>
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
            onChange={async (value) => await handleLocaleSwitch(value?.id)}
            value={currentLanguage}
            languages={languageData}
            loading={loading}
          />
        </Dialog>
      )}
    </>
  )
}
