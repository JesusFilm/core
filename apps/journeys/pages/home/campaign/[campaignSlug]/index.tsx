import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { ReactElement } from 'react'

import { CAMPAIGN_LANGUAGE_COOKIE } from '@core/journeys/ui/Campaign'

import { GetCampaignPublic_campaignPublic as CampaignPublic } from '../../../../__generated__/GetCampaignPublic'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import i18nConfig from '../../../../next-i18next.config'
import { CampaignPageWrapper } from '../../../../src/components/CampaignPageWrapper'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import {
  campaignPageCacheControl,
  fetchCampaignPublicInPageLanguage
} from '../../../../src/libs/getCampaignPublic'
import { getFlags } from '../../../../src/libs/getFlags'

interface CampaignLandingPageProps {
  campaign: CampaignPublic
}

function CampaignLandingPage({
  campaign
}: CampaignLandingPageProps): ReactElement {
  return (
    <CampaignPageWrapper
      campaign={campaign}
      pageKind={CampaignPageKind.landing}
    />
  )
}

// Rendered per request (PRD §2): the Page Language is decided from the
// request — `?lang` naming a campaign language, then the cookie the header
// select wrote, then `Accept-Language`, then the campaign default — before
// the one page query. The response is shared-cacheable only when the URL's
// `lang` param decided; a draft or unknown slug is not found.
export const getServerSideProps: GetServerSideProps<
  CampaignLandingPageProps
> = async (context) => {
  const slug = context.params?.campaignSlug?.toString() ?? ''
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
  if (result == null) {
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
      campaign: result.campaign
    }
  }
}

export default CampaignLandingPage
