import { GetStaticPaths, GetStaticProps } from 'next'

import {
  CampaignStaticProps,
  getCampaignStaticProps
} from '../../../../../../src/libs/campaignStaticProps'
import CampaignRegionPage from '../../[regionSlug]'

// The Region Page in the campaign language the proxy rewrote `?lang=` to. A
// tag that is not a campaign language redirects to the default-language page.
export const getStaticProps: GetStaticProps<CampaignStaticProps> = async (
  context
) =>
  await getCampaignStaticProps({
    slug: context.params?.campaignSlug?.toString() ?? '',
    regionSlug: context.params?.regionSlug?.toString() ?? '',
    language: context.params?.lang?.toString(),
    locale: context.locale
  })

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default CampaignRegionPage
