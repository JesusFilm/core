import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { ReactElement } from 'react'

import { CAMPAIGN_LANGUAGE_COOKIE } from '@core/journeys/ui/Campaign'

import {
  GetCampaignPublic_campaignPublic as CampaignPublic,
  GetCampaignPublic_campaignPublic_regions as CampaignRegion
} from '../../../../__generated__/GetCampaignPublic'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import i18nConfig from '../../../../next-i18next.config'
import { CampaignPageWrapper } from '../../../../src/components/CampaignPageWrapper'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import {
  campaignPageCacheControl,
  fetchCampaignPublicInPageLanguage
} from '../../../../src/libs/getCampaignPublic'
import { getFlags } from '../../../../src/libs/getFlags'

interface CampaignRegionPageProps {
  campaign: CampaignPublic
  region: CampaignRegion
}

function CampaignRegionPage({
  campaign,
  region
}: CampaignRegionPageProps): ReactElement {
  return (
    <CampaignPageWrapper
      campaign={campaign}
      pageKind={CampaignPageKind.regionTemplate}
      region={region}
    />
  )
}

// The shared Region Page rendered for one region: the slug is resolved
// against `campaignPublic.regions` (listed and orphan alike) and is not
// found until the region exists. The Page Language is decided from the
// request exactly as on the landing page, so a region switch keeps it.
export const getServerSideProps: GetServerSideProps<
  CampaignRegionPageProps
> = async (context) => {
  const slug = context.params?.campaignSlug?.toString() ?? ''
  const regionSlug = context.params?.regionSlug?.toString() ?? ''
  const translations = await serverSideTranslations(
    context.locale ?? 'en',
    ['apps-journeys', 'libs-journeys-ui'],
    i18nConfig
  )
  const result = await fetchCampaignPublicInPageLanguage(
    createApolloClient(),
    slug,
    {
      param: context.query.lang,
      cookie: context.req.cookies[CAMPAIGN_LANGUAGE_COOKIE],
      acceptLanguage: context.req.headers['accept-language']
    }
  )
  const region = result?.campaign.regions.find(
    (candidate) => candidate.slug === regionSlug
  )
  if (result == null || region == null) {
    return { props: { ...translations }, notFound: true }
  }
  context.res.setHeader(
    'Cache-Control',
    campaignPageCacheControl(result.language, result.campaign.languages.length)
  )
  return {
    props: {
      flags: await getFlags(),
      ...translations,
      campaign: result.campaign,
      region
    }
  }
}

export default CampaignRegionPage
