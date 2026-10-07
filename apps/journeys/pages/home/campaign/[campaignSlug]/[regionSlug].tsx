import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { ReactElement } from 'react'

import type { WorldMapShapes } from '@core/journeys/ui/Campaign'

import {
  GetCampaignPublic_campaignPublic as CampaignPublic,
  GetCampaignPublic_campaignPublic_regions as CampaignRegion
} from '../../../../__generated__/GetCampaignPublic'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import i18nConfig from '../../../../next-i18next.config'
import { CampaignPageWrapper } from '../../../../src/components/CampaignPageWrapper'
import { createApolloClient } from '../../../../src/libs/apolloClient'
import { fetchCampaignPublic } from '../../../../src/libs/getCampaignPublic'
import { getFlags } from '../../../../src/libs/getFlags'
import { getWorldMap } from '../../../../src/libs/getWorldMap'

interface CampaignRegionPageProps {
  campaign: CampaignPublic
  worldMap: WorldMapShapes
  region: CampaignRegion
}

function CampaignRegionPage({
  campaign,
  region,
  worldMap
}: CampaignRegionPageProps): ReactElement {
  return (
    <CampaignPageWrapper
      campaign={campaign}
      worldMap={worldMap}
      pageKind={CampaignPageKind.regionTemplate}
      region={region}
    />
  )
}

// The shared Region Page rendered for one region: the slug is resolved
// against `campaignPublic.regions` (listed and orphan alike) and is not
// found until the region exists. Same ISR values as the landing page.
export const getStaticProps: GetStaticProps<CampaignRegionPageProps> = async (
  context
) => {
  const slug = context.params?.campaignSlug?.toString() ?? ''
  const regionSlug = context.params?.regionSlug?.toString() ?? ''
  const translations = await serverSideTranslations(
    context.locale ?? 'en',
    ['apps-journeys', 'libs-journeys-ui'],
    i18nConfig
  )
  const campaign = await fetchCampaignPublic(createApolloClient(), slug)
  const region = campaign?.regions.find(
    (candidate) => candidate.slug === regionSlug
  )
  if (campaign == null || region == null) {
    return { props: { ...translations }, notFound: true, revalidate: 1 }
  }
  return {
    props: {
      flags: await getFlags(),
      ...translations,
      campaign,
      region,
      worldMap: await getWorldMap()
    },
    revalidate: 60
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default CampaignRegionPage
