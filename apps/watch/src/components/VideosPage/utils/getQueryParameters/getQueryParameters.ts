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

  function getFilter(): VideoPageFilter {
    const query = new URLSearchParams(searchString?.split('?')[1])

    const getQueryParamArray = (param: string | null): string[] | undefined =>
      param != null ? [param] : undefined

    return {
      availableVariantLanguageIds: getQueryParamArray(query.get('languages')),
      subtitleLanguageIds: getQueryParamArray(query.get('subtitles')),
      title: query.get('title') ?? undefined
    }
  }

  return getFilter()
}
