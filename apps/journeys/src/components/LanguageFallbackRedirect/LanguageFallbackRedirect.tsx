import { ComponentType, ReactElement, useEffect } from 'react'

import { CAMPAIGN_LANGUAGE_PARAM } from '@core/journeys/ui/Campaign'

export interface LanguageFallbackProps {
  /** The plain page the `_lang` page stands in for, without a query. */
  languageFallback: string
}

interface LanguageFallbackRedirectProps {
  destination: string
}

/**
 * A `_lang` page is generated once per path, so it cannot carry the visitor's
 * query to a redirect of its own. For a tag that is not a campaign language,
 * or a segment that is not a region, it renders nothing and sends the browser
 * to the plain page with the query it arrived with, minus `lang`.
 */
export function LanguageFallbackRedirect({
  destination
}: LanguageFallbackRedirectProps): ReactElement {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.delete(CAMPAIGN_LANGUAGE_PARAM)
    const search = params.toString()
    window.location.replace(
      search === '' ? destination : `${destination}?${search}`
    )
  }, [destination])

  return <></>
}

/**
 * The page of a `_lang` route: `Page` when static props resolved a campaign
 * page, the redirect when they resolved a fallback.
 */
export function withLanguageFallback<Props extends object>(
  Page: ComponentType<Props>
): ComponentType<Props | LanguageFallbackProps> {
  return function PageOrLanguageFallback(
    props: Props | LanguageFallbackProps
  ): ReactElement {
    if ('languageFallback' in props)
      return <LanguageFallbackRedirect destination={props.languageFallback} />
    return <Page {...props} />
  }
}
