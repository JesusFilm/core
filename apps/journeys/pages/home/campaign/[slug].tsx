import { CombinedGraphQLErrors } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import {
  GetCampaign_campaignBySlug as Campaign,
  GetCampaign_campaignCountryStats as CampaignCountryStats,
  GetCampaign,
  GetCampaignVariables
} from '../../../__generated__/GetCampaign'
import i18nConfig from '../../../next-i18next.config'
import { CampaignView } from '../../../src/components/CampaignView'
import { createApolloClient } from '../../../src/libs/apolloClient'
import { gateEmbedMedia } from '../../../src/libs/gateEmbedMedia'
import { GET_CAMPAIGN } from '../../../src/libs/getCampaign'
import { getFlags } from '../../../src/libs/getFlags'
import { isValidGallerySlug } from '../../../src/libs/isValidGallerySlug'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'your.nextstep.is'

interface CampaignPageRouteProps {
  campaign: Campaign
  countryStats: CampaignCountryStats | null
}

function ogImageFor(
  campaign: Campaign
): { url: string; width?: number; height?: number; alt: string }[] {
  if (
    campaign.backgroundImageSrc != null &&
    campaign.backgroundImageSrc !== ''
  ) {
    return [
      {
        url: campaign.backgroundImageSrc,
        alt: campaign.backgroundImageAlt ?? campaign.title
      }
    ]
  }
  const image = campaign.templateJourneys.find(
    (template) =>
      template.primaryImageBlock?.src != null &&
      template.primaryImageBlock.src !== ''
  )?.primaryImageBlock
  if (image?.src != null && image.src !== '') {
    return [
      {
        url: image.src,
        width: image.width,
        height: image.height,
        alt: image.alt
      }
    ]
  }
  return []
}

function CampaignPageRoute({
  campaign,
  countryStats
}: CampaignPageRouteProps): ReactElement {
  const canonicalUrl = `https://${ROOT_DOMAIN}/campaign/${campaign.slug}`

  return (
    <>
      <NextSeo
        title={campaign.title}
        description={campaign.description}
        canonical={canonicalUrl}
        openGraph={{
          type: 'website',
          title: campaign.title,
          description: campaign.description,
          url: canonicalUrl,
          images: ogImageFor(campaign)
        }}
        twitter={{
          site: '@YourNextStepIs',
          cardType: 'summary_large_image'
        }}
      />
      <CampaignView campaign={campaign} countryStats={countryStats} />
    </>
  )
}

// SSR rather than ISR, for the same reasons as the template-gallery page:
// admin-managed, unpublish→republish cycles, and `Query.campaignBySlug` is
// uncached in Yoga. The country stats are cached upstream for a few minutes.
export const getServerSideProps: GetServerSideProps<
  CampaignPageRouteProps
> = async (context) => {
  context.res.setHeader('Cache-Control', 'no-store, max-age=0')

  const slug = context.params?.slug?.toString() ?? ''
  const translations = await serverSideTranslations(
    context.locale ?? 'en',
    ['apps-journeys', 'libs-journeys-ui'],
    i18nConfig
  )

  if (!isValidGallerySlug(slug)) {
    return { props: { ...translations }, notFound: true }
  }

  const apolloClient = createApolloClient()
  const { data, error } = await apolloClient.query<
    GetCampaign,
    GetCampaignVariables
  >({
    query: GET_CAMPAIGN,
    variables: { slug },
    errorPolicy: 'all'
  })

  const errors = CombinedGraphQLErrors.is(error) ? error.errors : []

  const campaign = data?.campaignBySlug
  if (campaign == null) {
    if (errors.length > 0) {
      const MAX_LOGGED_ERRORS = 5
      console.warn('[campaign getServerSideProps] null branch', {
        slug,
        errorCount: errors.length,
        errors: errors.slice(0, MAX_LOGGED_ERRORS).map((e) => ({
          message: e.message,
          path: e.path,
          code:
            typeof e.extensions?.code === 'string' ? e.extensions.code : null
        })),
        truncated: errors.length > MAX_LOGGED_ERRORS
      })
    }
    return { props: { ...translations }, notFound: true }
  }

  // A stats failure (Plausible down, timeout) must not take the page down —
  // the section renders its "unavailable" state instead.
  const countryStats = data?.campaignCountryStats ?? null
  if (countryStats == null && errors.length > 0) {
    console.warn('[campaign getServerSideProps] country stats unavailable', {
      slug,
      errorCount: errors.length
    })
  }

  return {
    props: {
      flags: await getFlags(),
      ...translations,
      campaign: { ...campaign, media: gateEmbedMedia(campaign.media) },
      countryStats
    }
  }
}

export default CampaignPageRoute
