import { GetServerSidePropsContext } from 'next'
import { useTranslation } from 'next-i18next/pages'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'

import { CampaignBuilder } from '../../src/components/CampaignBuilder'
import { PageWrapper } from '../../src/components/PageWrapper'
import { useAuth } from '../../src/libs/auth'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

interface CampaignBuilderPageProps {
  campaignId: string
}

// The campaign itself is loaded client-side by CampaignBuilder, which renders
// its own not-found / error states. Doing the existence check here would turn
// any transient gateway error into a hard 404 (and hide the real message).
export default function CampaignBuilderPage({
  campaignId
}: CampaignBuilderPageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { user } = useAuth()

  return (
    <>
      <NextSeo title={t('Campaign builder')} />
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

  const { redirect, translations } = await initAndAuthApp({
    user,
    locale: ctx.locale,
    resolvedUrl: ctx.resolvedUrl
  })

  if (redirect != null) return { redirect }

  const campaignId = ctx.params?.campaignId?.toString() ?? ''
  if (campaignId === '') return { props: { ...translations }, notFound: true }

  return {
    props: {
      userSerialized: JSON.stringify(user),
      campaignId,
      ...translations
    }
  }
}
