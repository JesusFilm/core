import AddOutlined from '@mui/icons-material/AddOutlined'
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined'
import LanguageOutlined from '@mui/icons-material/LanguageOutlined'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback } from 'react'
import { gql, useQuery } from '@apollo/client'
import compact from 'lodash/compact'

import { Select, SelectContent, SelectTrigger, SelectValue } from '../../Select'

import { useVideo } from '../../../libs/videoContext'
import {
  GetLanguagesSlug,
  GetLanguagesSlug_video_variantLanguagesWithSlug_language as Language
} from '../../../../__generated__/GetLanguagesSlug'

const GET_LANGUAGES_SLUG = gql`
  query GetLanguagesSlug($id: ID!) {
    video(id: $id, idType: databaseId) {
      variantLanguagesWithSlug {
        slug
        language {
          id
          slug
          name {
            value
            primary
          }
        }
      }
    }
  }
`

export function AudioLanguageSelect(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { id, variant, variantLanguagesCount, container } = useVideo()

  const { data } = useQuery<GetLanguagesSlug>(GET_LANGUAGES_SLUG, {
    variables: {
      id
    }
  })

  const languages = compact(
    data?.video?.variantLanguagesWithSlug?.map(({ language }) => language)
  )

  const nativeName = variant?.language?.name.find(
    ({ primary }) => !primary
  )?.value
  const localName = variant?.language?.name.find(
    ({ primary }) => primary
  )?.value

  function getLanguageHref(languageId: string): string {
    const languageSlug = data?.video?.variantLanguagesWithSlug?.find(
      (languages) => languages.language?.id === languageId
    )?.slug

    if (languageSlug != null) {
      return `/watch${
        container?.slug != null ? `/${container.slug}/` : '/'
      }${languageSlug}`
    }
    return '#'
  }

  function getNonPrimaryLanguageName(language: Language): string | undefined {
    // 529 (English) does not have a non-primary language name
    if (language.id === '529')
      return language.name.find(({ primary }) => primary)?.value
    return language.name.find(({ primary }) => !primary)?.value
  }

  return (
    <Select value={variant?.id}>
      <SelectTrigger
        data-testid="AudioLanguageSelectTrigger"
        className={`
          border-none
          bg-transparent
          p-0
          h-auto
          shadow-none
          hover:bg-transparent
          focus:outline-none
          focus:ring-0
          focus:ring-offset-0
          focus:border-0
          cursor-pointer
          [&>svg]:hidden
          focus-visible:outline-none
          focus-visible:ring-0
          focus-visible:ring-offset-0
          focus-visible:border-0
        `}
      >
        <div className="flex items-center gap-1">
          <LanguageOutlined fontSize="small" className="text-white" />
          <SelectValue>
            <span
              className={`
                text-base
                font-semibold
                text-white
                truncate
                overflow-hidden
                whitespace-nowrap
                font-sans
                leading-tight
              `}
            >
              {localName ?? nativeName}
            </span>
          </SelectValue>
          <div className="hidden lg:flex items-center gap-1">
            <AddOutlined fontSize="small" className="text-white" />
            <span
              className={`
                text-base
                font-semibold
                text-white
                whitespace-nowrap
                font-sans
                leading-tight
              `}
            >
              {t('{{ languageCount }} Languages', {
                languageCount: variantLanguagesCount - 1
              })}
            </span>
          </div>
          <KeyboardArrowDownOutlined fontSize="small" className="text-white" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-lg">
        {languages?.map((language: Language) => {
          const href = getLanguageHref(language.id)
          return (
            <a
              key={language.id}
              href={href}
              className={`
                block
                hover:bg-gray-100
                focus:bg-gray-100
                data-[highlighted]:bg-gray-100
                data-[state=checked]:bg-blue-50
                data-[state=checked]:text-blue-900
                cursor-pointer
                p-2
                rounded
              `}
            >
              <div className="flex items-center gap-1">
                <span
                  className="text-sm text-black font-sans"
                  data-testid="AudioLanguageSelectNonPrimaryLanguageName"
                >
                  {getNonPrimaryLanguageName(language)}
                </span>
                {language.name.find(({ primary }) => primary)?.value && (
                  <span
                    className="text-xs text-gray-600 font-sans"
                    data-testid="AudioLanguageSelectPrimaryLanguageName"
                  >
                    ({language.name.find(({ primary }) => primary)?.value})
                  </span>
                )}
              </div>
            </a>
          )
        })}
      </SelectContent>
    </Select>
  )
}
