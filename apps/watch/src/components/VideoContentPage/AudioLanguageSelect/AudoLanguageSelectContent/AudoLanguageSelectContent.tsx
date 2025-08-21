import { useQuery } from '@apollo/client'
import compact from 'lodash/compact'

import {
  GetLanguagesSlug,
  GetLanguagesSlug_video_variantLanguagesWithSlug_language as Language
} from '../../../../../__generated__/GetLanguagesSlug'
import { useVideo } from '../../../../libs/videoContext'
import { GET_LANGUAGES_SLUG } from '../../../AudioLanguageDialog'
import { SelectContent } from '../../../Select'

export function AudoLanguageSelectContent() {
  const { id, container } = useVideo()

  const { data } = useQuery<GetLanguagesSlug>(GET_LANGUAGES_SLUG, {
    variables: {
      id
    }
  })
  const languages = compact(
    data?.video?.variantLanguagesWithSlug?.map(({ language }) => language)
  )

  function getNonPrimaryLanguageName(language: Language): string | undefined {
    // 529 (English) does not have a non-primary language name
    if (language.id === '529')
      return language.name.find(({ primary }) => primary)?.value
    return language.name.find(({ primary }) => !primary)?.value
  }

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
  return (
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
  )
}
