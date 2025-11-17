import { ReactElement } from 'react'
import { useTranslation } from 'next-i18next'

import { VideoLabel } from '../../../__generated__/globalTypes'
import {
  LanguageFilterDropdown,
  type LanguageFilterOption
} from '../LanguageFilterDropdown'

interface CollectionMetadataProps {
  title: string
  description: string
  snippet?: string
  label: VideoLabel
  childCount: number
  languageOptions: LanguageFilterOption[]
  languagesLoading: boolean
  selectedLanguageSlug: string
  onLanguageSelect: (slug: string) => void
}

export function CollectionMetadata({
  title,
  description,
  snippet,
  label,
  childCount,
  languageOptions,
  languagesLoading,
  selectedLanguageSlug,
  onLanguageSelect
}: CollectionMetadataProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <div
      className="responsive-container relative z-10 space-y-4"
      data-testid="CollectionMetadata"
    >
      <div className="flex items-center gap-8">
        <div className="flex-1 space-y-3">
          <p className="text-lg leading-relaxed text-stone-200/80 xl:text-xl">
            {description}
          </p>
        </div>
        <div className="w-80 flex-shrink-0 space-y-3">
          <p className="text-sm font-semibold tracking-wider text-red-100/70 uppercase">
            {t('Languages')}
          </p>
          <LanguageFilterDropdown
            options={languageOptions}
            loading={languagesLoading}
            selectedValue={selectedLanguageSlug}
            placeholder={t('Search languages...')}
            emptyLabel={t('No languages found.')}
            loadingLabel={t('Loading languages...')}
            onSelect={onLanguageSelect}
          />
        </div>
      </div>
    </div>
  )
}
