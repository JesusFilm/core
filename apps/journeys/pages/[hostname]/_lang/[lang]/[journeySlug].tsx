import { GetStaticPaths, GetStaticProps } from 'next'

import {
  CAMPAIGN_REVALIDATE_SECONDS,
  getHostCampaignStaticProps
} from '../../../../src/libs/campaignStaticProps'
import HostSlugPage from '../../[journeySlug]'

// A region of a Campaign Root in the campaign language the proxy rewrote
// `?lang=` to. A journey slug, or a tag that is not one of the campaign's
// languages, goes to the plain `/<segment>`, which serves journeys.
export const getStaticProps: GetStaticProps = async (context) => {
  const segment = context.params?.journeySlug?.toString()
  return (
    (await getHostCampaignStaticProps({
      hostname: context.params?.hostname?.toString() ?? '',
      segment,
      language: context.params?.lang?.toString(),
      locale: context.locale
    })) ?? {
      redirect: { destination: `/${segment ?? ''}`, permanent: false },
      revalidate: CAMPAIGN_REVALIDATE_SECONDS
    }
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default HostSlugPage
