import { useTranslation } from 'next-i18next/pages'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

import { transformData } from './util/transformData'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  // Treat a non-ok response (e.g. a 500 `{ error: '...' }`) as a SWR error so
  // the error body never reaches transformData and isLoading resolves.
  if (!res.ok) throw new Error(`Failed to load languages: ${res.status}`)
  return res.json()
}

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
