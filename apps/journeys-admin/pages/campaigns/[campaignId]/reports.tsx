import { CombinedGraphQLErrors, NormalizedCacheObject } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import {
  GetCampaignReport,
  GetCampaignReportVariables
} from '../../../__generated__/GetCampaignReport'
import {
  CampaignReport,
  GET_CAMPAIGN_REPORT
} from '../../../src/components/CampaignReport'
import { PageWrapper } from '../../../src/components/PageWrapper'
import { useAuth } from '../../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../../src/libs/initAndAuthApp'

function CampaignReportPage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()
  const router = useRouter()
  const campaignId = router.query.campaignId as string

  return (
    <>
      <NextSeo title={t('Campaign Report')} />
      <PageWrapper
        title={t('Campaign Report')}
        user={user ?? undefined}
        backHref={`/campaigns/${campaignId}`}
        mainBodyPadding={false}
      >
        <CampaignReport campaignId={campaignId} />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)
  const user = toUser(tokens)

  const { apolloClient, flags, redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  if (flags.campaignBuilder !== true)
    return { redirect: { destination: '/', permanent: false } }

  // The editor's rule, the API's campaign Read: a manager or member of the
  // campaign's team gets in; anyone else is sent back to the campaigns list.
  try {
    await apolloClient.query<GetCampaignReport, GetCampaignReportVariables>({
      query: GET_CAMPAIGN_REPORT,
      variables: { id: ctx.query?.campaignId as string }
    })
  } catch (error) {
    if (
      CombinedGraphQLErrors.is(error) &&
      error.errors.some(
        (graphQLError) =>
          graphQLError.extensions?.code === 'NOT_FOUND' ||
          graphQLError.extensions?.code === 'FORBIDDEN'
      )
    )
      return { redirect: { destination: '/?type=campaigns', permanent: false } }
    throw error
  }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      initialApolloState: apolloClient.cache.extract() as NormalizedCacheObject,
      ...translations,
      flags
    }
  }
}

export default CampaignReportPage
