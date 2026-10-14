import { GetStaticPaths, GetStaticProps } from 'next'

import {
  CAMPAIGN_REVALIDATE_SECONDS,
  getHostCampaignStaticProps
} from '../../../../src/libs/campaignStaticProps'
import HostJourneysPage from '../../index'

// A Campaign Root's landing page in the campaign language the proxy rewrote
// `?lang=` to. Without a published root campaign, or for a tag that is not
// one of its languages, the visitor goes to `/`.
export const getStaticProps: GetStaticProps = async (context) =>
  (await getHostCampaignStaticProps({
    hostname: context.params?.hostname?.toString() ?? '',
    language: context.params?.lang?.toString(),
    locale: context.locale
  })) ?? {
    redirect: { destination: '/', permanent: false },
    revalidate: CAMPAIGN_REVALIDATE_SECONDS
  }

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default HostJourneysPage
