import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { ReactElement } from 'react'

import type { WorldMapShapes } from '@core/journeys/ui/Campaign'

import { GetCampaignPublic_campaignPublic as CampaignPublic } from '../../../../__generated__/GetCampaignPublic'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import i18nConfig from '../../../../next-i18next.config'
import { CampaignPageWrapper } from '../../../../src/components/CampaignPageWrapper'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import { fetchCampaignPublic } from '../../../../src/libs/getCampaignPublic'
import { getFlags } from '../../../../src/libs/getFlags'
import { getWorldMap } from '../../../../src/libs/getWorldMap'

interface CampaignLandingPageProps {
  campaign: CampaignPublic
  worldMap: WorldMapShapes
}

function CampaignLandingPage({
  campaign,
  worldMap
}: CampaignLandingPageProps): ReactElement {
  return (
    <CampaignPageWrapper
      campaign={campaign}
      worldMap={worldMap}
      pageKind={CampaignPageKind.landing}
    />
  )
}

// ISR as the journey routes (PRD §11): rebuilt in the background about once
// a minute and on demand when the campaign is published or unpublished. A
// draft or unknown slug is not found with `revalidate: 1`, so a not-found
// never sticks once the campaign goes live.
export const getStaticProps: GetStaticProps<CampaignLandingPageProps> = async (
  context
) => {
  const slug = context.params?.campaignSlug?.toString() ?? ''
  const translations = await serverSideTranslations(
    context.locale ?? 'en',
    ['apps-journeys', 'libs-journeys-ui'],
    i18nConfig
  )
  const campaign = await fetchCampaignPublic(createApolloClient(), slug)
  if (campaign == null) {
    return { props: { ...translations }, notFound: true, revalidate: 1 }
  }
  return {
    props: {
      flags: await getFlags(),
      ...translations,
      campaign,
      worldMap: await getWorldMap()
    },
    revalidate: 60
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default CampaignLandingPage
