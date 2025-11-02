import { ApolloError, gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'

import {
  GetMuxSupportedLanguages,
  GetMuxSupportedLanguages_languages as MuxLanguage
} from '../../../__generated__/GetMuxSupportedLanguages'

export type { MuxLanguage }

export const GET_MUX_SUPPORTED_LANGUAGES = gql`
  query GetMuxSupportedLanguages($where: LanguagesFilter) {
    languages(where: $where) {
      id
      bcp47
      name {
        value
        primary
      }
    }
  }
`

const muxSupportedLanguages = [
  { code: 'en', status: 'Stable' },
  { code: 'es', status: 'Stable' },
  { code: 'it', status: 'Stable' },
  { code: 'pt', status: 'Stable' },
  { code: 'de', status: 'Stable' },
  { code: 'fr', status: 'Stable' },
  { code: 'pl', status: 'Beta' },
  { code: 'ru', status: 'Beta' },
  { code: 'nl', status: 'Beta' },
  { code: 'ca', status: 'Beta' },
  { code: 'tr', status: 'Beta' },
  { code: 'sv', status: 'Beta' },
  { code: 'uk', status: 'Beta' },
  { code: 'no', status: 'Beta' },
  { code: 'fi', status: 'Beta' },
  { code: 'sk', status: 'Beta' },
  { code: 'el', status: 'Beta' },
  { code: 'cs', status: 'Beta' },
  { code: 'hr', status: 'Beta' },
  { code: 'da', status: 'Beta' },
  { code: 'ro', status: 'Beta' },
  { code: 'bg', status: 'Beta' }
] as const

type MuxLanguageStatus = 'Stable' | 'Beta'

export interface MuxLanguageWithStatus {
  id: string
  bcp47: string
  name: Array<{ value: string; primary: boolean }>
  status: MuxLanguageStatus
}

interface UseMuxSupportedLanguagesReturn {
  languages: MuxLanguageWithStatus[]
  loading: boolean
  error: ApolloError | undefined
}

export function useMuxSupportedLanguages(): UseMuxSupportedLanguagesReturn {
  const bcp47Codes = muxSupportedLanguages.map((lang) => lang.code)

  const { data, loading, error } = useQuery<GetMuxSupportedLanguages>(
    GET_MUX_SUPPORTED_LANGUAGES,
    {
      variables: {
        where: {
          bcp47: bcp47Codes
        }
      }
    }
  )

  const languages = useMemo(() => {
    if (data?.languages == null) return []

    // Create a map for quick status lookup
    const statusMap = new Map(
      muxSupportedLanguages.map((lang) => [lang.code, lang.status])
    )

    // Merge API data with status information
    const result = data.languages
      .map((lang) => {
        const status = statusMap.get(lang.bcp47 ?? '')
        if (status == null) return null

        return {
          id: lang.id,
          bcp47: lang.bcp47 ?? '',
          name: lang.name,
          status
        }
      })
      .filter((lang): lang is MuxLanguageWithStatus => lang != null)
    return result
  }, [data])

  return {
    languages,
    loading,
    error
  }
}
