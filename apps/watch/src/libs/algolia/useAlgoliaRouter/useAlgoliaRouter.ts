import { useRouter } from 'next/compat/router'
import { useEffect } from 'react'
import { useInstantSearch } from 'react-instantsearch'

export interface FilterParams {
  query: string | null
  languageId: string | null
  subtitleId: string | null
}

export function extractQueryParams(url: string): FilterParams {
  const params = new URLSearchParams(url.split('?')[1])
  const query = params.get('query')
  const languageId = params.get('menu[languageId]')
  const subtitleId = params.get('menu[subtitles]')
  return { query, languageId, subtitleId }
}

export function useAlgoliaRouter(): FilterParams {
  const router = useRouter()
  const decodedUrl = decodeURIComponent(router?.asPath ?? '')
  const { query, languageId, subtitleId } = extractQueryParams(decodedUrl)
  const hasQueryParams =
    query != null || languageId != null || subtitleId != null

  const { refresh } = useInstantSearch()
  useEffect(() => {
    if (hasQueryParams) {
      // Data from the server will be stale unless we refresh after setting language
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { query, languageId, subtitleId }
}
