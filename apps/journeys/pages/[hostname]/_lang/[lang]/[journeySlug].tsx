import { GetStaticPaths, GetStaticProps } from 'next'

import { plainPagePath } from '@core/journeys/ui/Campaign/libs/campaignAddress'

import {
  LanguageFallbackProps,
  withLanguageFallback
} from '../../../../src/components/LanguageFallbackRedirect'
import {
  CampaignStaticProps,
  getHostCampaignStaticProps,
  toLanguageFallback
} from '../../../../src/libs/campaignStaticProps'
import HostSlugPage from '../../[journeySlug]'

// A region of a Campaign Domain in the campaign language the proxy rewrote
// `?lang=` to. A journey slug, or a tag that is not one of the campaign's
// languages, goes to the plain `/<segment>`, which serves journeys, keeping
// the rest of the query.
export const getStaticProps: GetStaticProps<
  CampaignStaticProps | LanguageFallbackProps
> = async (context) => {
  const segment = context.params?.journeySlug?.toString()
  return toLanguageFallback(
    (await getHostCampaignStaticProps({
      hostname: context.params?.hostname?.toString() ?? '',
      segment,
      language: context.params?.lang?.toString(),
      locale: context.locale
    })) ?? {
      redirect: {
        destination: plainPagePath('', segment == null ? [] : [segment]),
        permanent: false
      }
    }
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default withLanguageFallback(HostSlugPage)
