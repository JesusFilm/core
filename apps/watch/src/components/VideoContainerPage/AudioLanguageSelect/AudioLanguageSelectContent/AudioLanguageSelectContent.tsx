import { useMemo } from 'react'

import { Language, useLanguages } from '../../../../libs/useLanguages'
import { useVideo } from '../../../../libs/videoContext'
import { useWatch } from '../../../../libs/watchContext'
import { SelectContent } from '../../../Select'

export function AudioLanguageSelectContent() {
  const { variant } = useVideo()
  const {
    state: { videoAudioLanguageIds }
  } = useWatch()
  const { languages } = useLanguages()

  const filteredLanguages = useMemo(
    () => languages.filter(({ id }) => videoAudioLanguageIds?.includes(id)),
    [languages, videoAudioLanguageIds]
  )

  return (
    <SelectContent className="bg-white border border-gray-200 shadow-lg">
      {filteredLanguages?.map((option: Language) => (
        <a
          key={option.id}
          href={`/watch${
            variant?.slug != null ? `/${variant.slug.split('/')[0]}.html/` : '/'
          }${option.slug}.html`}
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
          role="option"
          aria-label={option.displayName}
        >
          <div className="flex items-center gap-1">
            <span
              className="text-sm text-black font-sans"
              data-testid="AudioLanguageSelectDisplayLanguageName"
            >
              {option.displayName}
            </span>
            {option.nativeName?.value && (
              <span
                className="text-xs text-gray-600 font-sans"
                data-testid="AudioLanguageSelectNativeLanguageName"
              >
                ({option.nativeName?.value})
              </span>
            )}
          </div>
        </a>
      ))}
    </SelectContent>
  )
}
