import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { transformData } from './util/transformData'

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

    setLanguages(
      transformData(data, i18n.language).sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      )
    )
  }, [data, i18n])

  return { languages, isLoading }
}
