export interface VideoPageFilter {
  availableVariantLanguageIds?: string[]
  subtitleLanguageIds?: string[]
  title?: string
}

export function getQueryParameters(): VideoPageFilter {
  // we intentionally use window.location.search to prevent multiple renders
  // which occurs when using const { query } = useRouter()
  const searchString =
    typeof window !== 'undefined' ? window.location.search : undefined

  function getQueryParamArray(param: string | null): string[] | undefined {
    return param !== null ? [param] : undefined
  }

  function getFilter(): VideoPageFilter {
    const query = new URLSearchParams(searchString?.split('?')[1])

    return {
      availableVariantLanguageIds: getQueryParamArray(query.get('languages')),
      subtitleLanguageIds: getQueryParamArray(query.get('subtitles')),
      title: query.get('title') ?? undefined
    }
  }

  return getFilter()
}
