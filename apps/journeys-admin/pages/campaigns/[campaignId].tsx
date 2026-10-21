import { NormalizedCacheObject } from '@apollo/client'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { CampaignEditorPage } from '../../src/components/CampaignEditorPage'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

function CampaignEditPage(): ReactElement {
  const router = useRouter()
  const campaignId = router.query.campaignId

  return (
    <CampaignEditorPage
      campaignId={typeof campaignId === 'string' ? campaignId : undefined}
    />
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

  return {
    props: {
      userSerialized: JSON.stringify(user),
      initialApolloState: apolloClient.cache.extract() as NormalizedCacheObject,
      ...translations,
      flags
    }
  }
}

export default CampaignEditPage
