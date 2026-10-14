import { GetStaticPaths, GetStaticProps } from 'next'
import { ReactElement } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CampaignPageWrapper } from '../../../../src/components/CampaignPageWrapper'
import {
  CampaignStaticProps,
  getCampaignStaticProps
} from '../../../../src/libs/campaignStaticProps'

function CampaignRegionPage({
  campaign,
  region,
  worldMap
}: CampaignStaticProps): ReactElement {
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
// found until the region exists. ISR in the campaign's default language, as
// the landing page.
export const getStaticProps: GetStaticProps<CampaignStaticProps> = async (
  context
) =>
  await getCampaignStaticProps({
    slug: context.params?.campaignSlug?.toString() ?? '',
    regionSlug: context.params?.regionSlug?.toString() ?? '',
    locale: context.locale
  })

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default CampaignRegionPage
