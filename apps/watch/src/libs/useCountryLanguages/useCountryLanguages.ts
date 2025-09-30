import { useMemo } from 'react'
import useSWR from 'swr'

import type { CountryLanguagesResponse, CountryLanguage } from './types'

const fetcher = async (url: string): Promise<CountryLanguagesResponse> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to load country languages')
  return await response.json()
}

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000

export function useCountryLanguages(countryId?: string): {
  languages: CountryLanguage[]
  countryName?: string
  isLoading: boolean
  error?: Error
} {
  const shouldFetch = countryId != null && countryId !== ''

  const { data, error, isLoading } = useSWR<CountryLanguagesResponse>(
    shouldFetch ? `/api/countries/${countryId}/languages` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: FIFTEEN_MINUTES_IN_MS
    }
  )

  const languages = useMemo(
    () => data?.languages ?? [],
    [data?.languages]
  )

  return {
    languages,
    countryName: data?.countryName ?? undefined,
    isLoading,
    error: error ?? undefined
  }
}

