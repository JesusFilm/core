import last from 'lodash/last'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, Ref, useEffect, useState } from 'react'

import MediaStrip1 from '@core/shared/ui/icons/MediaStrip1'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetAllLanguages_languages as Language } from '../../../../__generated__/GetAllLanguages'
import { renderInput } from '../utils/renderInput'
import { renderOption } from '../utils/renderOption'

interface AudioTrackSelectProps {
  languagesData?: Language[]
  loading: boolean
  selectedLanguageId: string
  onChange: (selectedLanguageId: string) => void
  dropdownRef: Ref<HTMLDivElement>
}

export function AudioTrackSelect({
  languagesData,
  loading,
  selectedLanguageId,
  onChange,
  dropdownRef
}: AudioTrackSelectProps): ReactElement {
  const { t } = useTranslation()
  const router = useRouter()
  const [helperText, setHelperText] = useState<string>(t('2000 translations'))

  const selectedLanguage = languagesData?.find(
    (language) => language.id === selectedLanguageId
  )

  const [currentLanguage, setCurrentLanguage] = useState<
    LanguageOption | undefined
  >(undefined)

  useEffect(() => {
    if (selectedLanguage != null && !loading) {
      const path = router.asPath.split('/')
      const pathLanguageSlug = last(path)?.replace('.html', '')

      if (pathLanguageSlug !== selectedLanguage.slug && path.length > 3) {
        const pathLanguage = languagesData?.find(
          (language) => language.slug === pathLanguageSlug
        )

        setCurrentLanguage({
          id: pathLanguage?.id ?? '529',
          localName:
            pathLanguage?.name.find(({ primary }) => primary)?.value ??
            'English',
          nativeName:
            pathLanguage?.name.find(({ primary }) => !primary)?.value ??
            'English',
          slug: pathLanguage?.slug ?? 'english'
        })
        setHelperText(
          t('Not available in {{value}}', {
            value: selectedLanguage.slug
          })
        )
      } else {
        setCurrentLanguage({
          id: selectedLanguage.id,
          localName: selectedLanguage.name.find(({ primary }) => primary)
            ?.value,
          nativeName: selectedLanguage.name.find(({ primary }) => !primary)
            ?.value,
          slug: selectedLanguage.slug
        })
      }
    }
  }, [selectedLanguage, loading])

  const allLanguages =
    languagesData?.map((language: Language) => ({
      id: language.id,
      name: language.name,
      slug: language.slug
    })) ?? []

  function handleChange(language: LanguageOption): void {
    setCurrentLanguage(language)
    onChange(language.id)
  }

  return (
    <div className="mb-4 mx-6">
      <div className="flex items-center justify-between">
        <label
          htmlFor="audio-select"
          className="block text-sm font-medium text-gray-700 ml-7"
        >
          {t('Audio Track')}
        </label>
        <span className="text-sm text-gray-400 opacity-60">
          {currentLanguage?.nativeName}
        </span>
      </div>
      <div className="relative mt-1 flex items-center gap-2" ref={dropdownRef}>
        <MediaStrip1 fontSize="small" />
        <div className="relative w-full">
          <LanguageAutocomplete
            value={{
              id: currentLanguage?.id ?? '',
              localName: currentLanguage?.localName,
              nativeName: currentLanguage?.nativeName,
              slug: currentLanguage?.slug
            }}
            onChange={handleChange}
            languages={allLanguages}
            loading={loading}
            disabled={loading}
            renderInput={renderInput(helperText)}
            renderOption={renderOption}
          />
        </div>
      </div>
    </div>
  )
}
