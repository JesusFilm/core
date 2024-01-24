import { TranslationStatus } from '@crowdin/crowdin-api-client'
import { useRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog } from '@core/shared/ui/Dialog'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { useLanguagesQuery } from '../../libs/useLanguagesQuery'

import { languages } from './languageData'

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

  const [availableLanguageIds, setAvailableLanguageIds] = useState<string[]>([])

  console.log(availableLanguageIds)

  useEffect(() => {
    const translationStatus = new TranslationStatus(credentials)

    translationStatus
      .getProjectProgress(518286)
      .then((r) => {
        console.log(r.data)
        const availableLanguages = languages.filter((l) => {
          const crowdinLanguageData = r.data.find(
            // need a better way to do this check - not sure it's always the same.
            (cl) => cl.data.language.twoLettersCode === l.bcp47.slice(0, 2)
          )
          return crowdinLanguageData?.data.approvalProgress === 100
        })

        setAvailableLanguageIds(availableLanguages.map((l) => l.id))
      })
      .catch((error) => console.error(error))
  }, [])

  const { data, loading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: availableLanguageIds
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
