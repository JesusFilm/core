import type {
  GetStaticPaths,
  GetStaticPropsContext,
  GetStaticPropsResult
} from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'

import i18nConfig from '../../../next-i18next.config'
import { createApolloClient } from '../apolloClient'
import { apolloCampaignReader } from '../getCampaignPublic'
import { getFlags } from '../getFlags'

import { resolveCampaignPage } from './resolveCampaignPage'
import type {
  CampaignPageRequest,
  CampaignPageResolution,
  CampaignRouteResult
} from './resolveCampaignPage'

/** The ISR window of a campaign page and of a language fallback. */
const CAMPAIGN_REVALIDATE_SECONDS = 60

/**
 * A not-found regenerates after a second, so it never sticks once the
 * campaign is published.
 */
const CAMPAIGN_NOT_FOUND_REVALIDATE_SECONDS = 1

/**
 * The props of a campaign route: the resolved page or fallback itself, so
 * `_app` and `_document` find the campaign at `pageProps.campaign`.
 */
export type CampaignRouteProps = CampaignRouteResult & {
  flags: { [key: string]: boolean | undefined }
}

function param(
  context: GetStaticPropsContext,
  name: string
): string | undefined {
  return context.params?.[name]?.toString()
}

/**
 * The request a campaign route's params name: `campaignSlug` on the root
 * domain, else `hostname`; the region or journey segment; the `_lang` tag.
 */
function requestFromContext(
  context: GetStaticPropsContext
): CampaignPageRequest {
  const slug = param(context, 'campaignSlug')
  return {
    target:
      slug != null ? { slug } : { hostname: param(context, 'hostname') ?? '' },
    segment: param(context, 'regionSlug') ?? param(context, 'journeySlug'),
    language: param(context, 'lang')
  }
}

/** The Campaign Page a route's params name, read through Apollo. */
export async function readCampaignPage(
  context: GetStaticPropsContext
): Promise<CampaignPageResolution> {
  return await resolveCampaignPage(
    requestFromContext(context),
    apolloCampaignReader(createApolloClient())
  )
}

/**
 * The static props of a resolution: a page or a fallback on the ISR
 * window, with the flags and translations every page carries; anything
 * else not found, retried after a second.
 */
export async function campaignStaticPropsFor(
  result: CampaignPageResolution,
  locale: string | undefined
): Promise<GetStaticPropsResult<CampaignRouteProps>> {
  if (result.kind === 'notFound' || result.kind === 'notACampaign')
    return {
      notFound: true,
      revalidate: CAMPAIGN_NOT_FOUND_REVALIDATE_SECONDS
    }
  return {
    props: {
      flags: await getFlags(),
      ...(await serverSideTranslations(
        locale ?? 'en',
        ['apps-journeys', 'libs-journeys-ui'],
        i18nConfig
      )),
      ...result
    },
    revalidate: CAMPAIGN_REVALIDATE_SECONDS
  }
}

/** Every campaign route renders on first request and is cached from then on. */
export const getBlockingStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: 'blocking'
})
