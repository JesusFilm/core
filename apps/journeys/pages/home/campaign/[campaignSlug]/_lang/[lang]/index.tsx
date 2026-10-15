import { GetStaticPaths, GetStaticProps } from 'next'

import {
  LanguageFallbackProps,
  withLanguageFallback
} from '../../../../../../src/components/LanguageFallbackRedirect'
import {
  CampaignStaticProps,
  getCampaignStaticProps,
  toLanguageFallback
} from '../../../../../../src/libs/campaignStaticProps'
import CampaignLandingPage from '../../index'

// The landing page in the campaign language the proxy rewrote `?lang=` to. A
// tag that is not a campaign language sends the visitor to the
// default-language page, keeping the rest of the query.
export const getStaticProps: GetStaticProps<
  CampaignStaticProps | LanguageFallbackProps
> = async (context) =>
  toLanguageFallback(
    await getCampaignStaticProps({
      slug: context.params?.campaignSlug?.toString() ?? '',
      language: context.params?.lang?.toString(),
      locale: context.locale
    })
  )

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default withLanguageFallback(CampaignLandingPage)
