import NextLink from 'next/link'
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
    <SelectContent className="z-[9999] border border-gray-200 bg-white shadow-lg">
      {filteredLanguages?.map((option: Language) => (
        <NextLink
          key={option.id}
          href={`/watch${
            variant?.slug != null ? `/${variant.slug.split('/')[0]}.html/` : '/'
          }${option.slug}.html`}
          className={`block cursor-pointer rounded p-2 hover:bg-gray-100 focus:bg-gray-100 data-[highlighted]:bg-gray-100 data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-900`}
          role="option"
          aria-label={option.displayName}
        >
          <div className="flex w-full items-center justify-between gap-1">
            <span
              className="font-sans text-sm text-black"
              data-testid="AudioLanguageSelectDisplayLanguageName"
            >
              {option.displayName}
            </span>
            {option.nativeName &&
              option.nativeName.value !== option.displayName && (
                <span
                  className="font-sans text-xs text-gray-600"
                  data-testid="AudioLanguageSelectNativeLanguageName"
                >
                  {option.nativeName.value}
                </span>
              )}
          </div>
        </NextLink>
      ))}
    </SelectContent>
  )
}
