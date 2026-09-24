import { gql } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import {
  GetSSRCampaign,
  GetSSRCampaignVariables
} from '../../__generated__/GetSSRCampaign'
import { CampaignBuilder } from '../../src/components/CampaignBuilder'
import { PageWrapper } from '../../src/components/PageWrapper'
import { useAuth } from '../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

// Cheap existence + membership check on the server so an unknown or
// foreign campaign 404s instead of rendering an empty builder.
export const GET_SSR_CAMPAIGN = gql`
  query GetSSRCampaign($id: ID!) {
    campaign(id: $id) {
      id
      title
    }
  }
`

interface CampaignBuilderPageProps {
  campaignId: string
  campaignTitle: string
}

export default function CampaignBuilderPage({
  campaignId,
  campaignTitle
}: CampaignBuilderPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  return (
    <>
      <NextSeo title={t('Edit {{title}}', { title: campaignTitle })} />
      <PageWrapper
        title={t('Campaign builder')}
        user={user ?? undefined}
        backHref="/campaigns"
        mainBodyPadding={false}
      >
        <CampaignBuilder campaignId={campaignId} />
      </PageWrapper>
    </>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const tokens = await getAuthTokens(ctx)
  if (tokens == null) return redirectToLogin(ctx)
  const user = toUser(tokens)

  const { apolloClient, redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  const campaignId = ctx.params?.campaignId?.toString() ?? ''
  const campaignTitle = await apolloClient
    .query<GetSSRCampaign, GetSSRCampaignVariables>({
      query: GET_SSR_CAMPAIGN,
      variables: { id: campaignId }
    })
    .then(({ data }) => data?.campaign?.title ?? null)
    .catch(() => null)
  if (campaignTitle == null)
    return { props: { ...translations }, notFound: true }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      campaignId,
      campaignTitle,
      ...translations
    }
  }
}
