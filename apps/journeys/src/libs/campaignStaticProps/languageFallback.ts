import type { GetStaticPropsResult } from 'next'

import type { LanguageFallbackProps } from '../../components/LanguageFallbackRedirect'

import { CAMPAIGN_REVALIDATE_SECONDS } from './campaignStaticProps'

/**
 * Turn the redirect a `_lang` route would answer with into props for
 * `LanguageFallbackRedirect`: a static redirect cannot see the request's
 * query, so the browser makes the move and carries the query along.
 */
export function toLanguageFallback<Props>(
  result: GetStaticPropsResult<Props>
): GetStaticPropsResult<Props | LanguageFallbackProps> {
  if (!('redirect' in result)) return result
  const { destination } = result.redirect as { destination: string }
  return {
    props: { languageFallback: destination },
    revalidate: CAMPAIGN_REVALIDATE_SECONDS
  }
}
