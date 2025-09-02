import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { getLanguageIdFromLocale } from '../getLanguageIdFromLocale'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export interface LanguageName {
  id: string
  primary: boolean
  value: string
}

export interface Language {
  id: string
  slug: string
  /** The name of the language in the user's current language */
  name?: LanguageName
  /** The name of the language in English */
  englishName?: LanguageName
  /** The native name of the language */
  nativeName?: LanguageName
  /** display name is the name of the language in the user's current language, native name, english name or id */
  displayName: string
}

export function useLanguages(): { languages: Language[]; isLoading: boolean } {
  const { data, isLoading } = useSWR<string[][]>('/api/languages', fetcher)
  const { i18n } = useTranslation()
  const [languages, setLanguages] = useState<Language[]>([])

  useEffect(() => {
    if (!data || !i18n.language) return

    const currentLanguageId = getLanguageIdFromLocale(i18n.language)

    const newLanguages = data.map((language) => {
      const [languageIdSlugNative, ...names] = language
      const [id, slug, native] = languageIdSlugNative.split(':')
      const transformedNames: {
        id: string
        primary: boolean
        value: string
      }[] = names.map((returnedName) => {
        const [id, nameValue] = returnedName.split(':')
        return {
          id,
          primary: false,
          value: nameValue
        }
      })
      const name =
        transformedNames.find((name) => name.id === currentLanguageId) ??
        (native != null && id === currentLanguageId
          ? {
              id,
              primary: true,
              value: native
            }
          : undefined)
      const englishName =
        transformedNames.find((name) => name.id == '529') ??
        (native != null && id === '529'
          ? {
              id,
              primary: true,
              value: native
            }
          : undefined)
      const nativeName =
        native != null && id !== currentLanguageId
          ? {
              id,
              primary: true,
              value: native
            }
          : undefined

      return {
        id,
        slug,
        name,
        englishName,
        nativeName,
        displayName:
          name?.value ?? englishName?.value ?? nativeName?.value ?? id
      }
    })
    setLanguages(
      newLanguages.sort((a, b) => a.displayName.localeCompare(b.displayName))
    )
  }, [data, i18n])

  return { languages, isLoading }
}
