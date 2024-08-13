import { useRouter } from 'next/compat/router'
import { useEffect } from 'react'
import { useInstantSearch, useMenu } from 'react-instantsearch'

interface FilterParams {
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
  const hasQueryParams = (
    query != null ||
    languageId != null ||
    subtitleId != null
  )

  const { refine: refineLanguages } = useMenu({
    attribute: 'languageId'
  })
  const { refresh } = useInstantSearch()

  useEffect(() => {
    if (hasQueryParams) {
      if(languageId == null){
        refineLanguages('529')
      } else {
        // Data from the server will be stale unless we refresh after setting language
        refresh()
      }
    } else {
      // Refine doesn't take affect immediately
      setTimeout(() => {
        refineLanguages('529')
      })
    }
  }, [])

  return { query, languageId, subtitleId }
}
