import {
  CombinedGraphQLErrors,
  NormalizedCacheObject,
  gql
} from '@apollo/client'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import {
  GetSSRAdminCampaign,
  GetSSRAdminCampaignVariables
} from '../../__generated__/GetSSRAdminCampaign'
import { CampaignEditorPage } from '../../src/components/CampaignEditorPage'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../src/libs/auth/getAuthTokens'
import { initAndAuthApp } from '../../src/libs/initAndAuthApp'

export const GET_SSR_ADMIN_CAMPAIGN = gql`
  query GetSSRAdminCampaign($id: ID!) {
    campaign(id: $id) {
      id
    }
  }
`

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

  // Same rule as the API's campaign Read: a manager or member of the
  // campaign's team gets in; anyone else is sent back to the campaigns list.
  try {
    await apolloClient.query<GetSSRAdminCampaign, GetSSRAdminCampaignVariables>(
      {
        query: GET_SSR_ADMIN_CAMPAIGN,
        variables: { id: ctx.query?.campaignId as string }
      }
    )
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

export default CampaignEditPage
