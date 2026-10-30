import { GetStaticPaths, GetStaticProps } from 'next'
import { ReactElement } from 'react'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CampaignPageWrapper } from '../../../../src/components/CampaignPageWrapper'
import {
  CampaignStaticProps,
  getCampaignStaticProps
} from '../../../../src/libs/campaignStaticProps'

function CampaignLandingPage({ campaign }: CampaignStaticProps): ReactElement {
  return (
    <CampaignPageWrapper
      campaign={campaign}
      pageKind={CampaignPageKind.landing}
    />
  )
}

// ISR as the journey routes (PRD §11): rebuilt in the background about once
// a minute and on demand when the campaign is published or unpublished. This
// route is the campaign's default language; `?lang=` is rewritten by the
// proxy to `_lang/[lang]`, and a visitor's cookie or `Accept-Language` choice
// is followed from the page itself.
export const getStaticProps: GetStaticProps<CampaignStaticProps> = async (
  context
) =>
  await getCampaignStaticProps({
    slug: context.params?.campaignSlug?.toString() ?? '',
    locale: context.locale
  })

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: [], fallback: 'blocking' }
}

export default CampaignLandingPage
