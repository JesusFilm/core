import { GetStaticProps } from 'next'

import { CampaignRoute } from '../../../../src/components/CampaignRoute'
import {
  CampaignRouteProps,
  campaignStaticPropsFor,
  getBlockingStaticPaths,
  readCampaignPage
} from '../../../../src/libs/resolveCampaignPage'

// The root-domain Campaign Address: the landing page here, a Region Page at
// `[regionSlug]`, and each in a Page Language at `_lang/[lang]`, which the
// proxy rewrites `?lang=` to. All four bind the same route; the resolver
// reads the params. ISR as the journey routes.
export const getStaticProps: GetStaticProps<CampaignRouteProps> = async (
  context
) =>
  await campaignStaticPropsFor(await readCampaignPage(context), context.locale)

export const getStaticPaths = getBlockingStaticPaths

export default CampaignRoute
