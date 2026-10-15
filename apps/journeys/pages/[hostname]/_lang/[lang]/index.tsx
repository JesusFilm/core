import { GetStaticPaths, GetStaticProps } from 'next'

import {
  LanguageFallbackProps,
  withLanguageFallback
} from '../../../../src/components/LanguageFallbackRedirect'
import {
  CampaignStaticProps,
  getHostCampaignStaticProps,
  toLanguageFallback
} from '../../../../src/libs/campaignStaticProps'
import HostJourneysPage from '../../index'

// A Campaign Root's landing page in the campaign language the proxy rewrote
// `?lang=` to. Without a published root campaign, or for a tag that is not
// one of its languages, the visitor goes to `/`, keeping the rest of the
// query.
export const getStaticProps: GetStaticProps<
  CampaignStaticProps | LanguageFallbackProps
> = async (context) =>
  toLanguageFallback(
    (await getHostCampaignStaticProps({
      hostname: context.params?.hostname?.toString() ?? '',
      language: context.params?.lang?.toString(),
      locale: context.locale
    })) ?? { redirect: { destination: '/', permanent: false } }
  )

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default withLanguageFallback(HostJourneysPage)
