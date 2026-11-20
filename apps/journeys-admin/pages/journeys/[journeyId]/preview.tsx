import { gql } from '@apollo/client'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import type { ReactElement } from 'react'

import i18nConfig from '../../../next-i18next.config'
import { PrivateJourneyPreview } from '../../../src/components/PrivateJourneyPreview'
import { createApolloClient } from '../../../src/libs/apolloClient'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../src/libs/auth/getAuthTokens'

export const GET_PRIVATE_PREVIEW_ACCESS = gql`
  query GetPrivatePreviewAccess($id: ID!, $expectedRevision: String) {
    journeyPreview(id: $id, expectedRevision: $expectedRevision) {
      id
    }
  }
`

export default function PreviewPage({
  journeyId,
  revision
}: {
  journeyId: string
  revision?: string
}): ReactElement {
  return (
    <>
      <NextSeo noindex nofollow title="Private preview" />
      <PrivateJourneyPreview
        key={`${journeyId}:${revision ?? ''}`}
        journeyId={journeyId}
        revision={revision}
      />
    </>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  ctx.res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  ctx.res.setHeader('Vary', 'Cookie')
  ctx.res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  const tokens = await getAuthTokens(ctx)
  if (!tokens || toUser(tokens).isAnonymous) return redirectToLogin(ctx)
  const journeyId = ctx.params?.journeyId
  const revision = ctx.query.revision
  if (
    typeof journeyId !== 'string' ||
    (revision != null &&
      (typeof revision !== 'string' || !/^(0|[1-9]\d{0,19})$/.test(revision)))
  )
    return { notFound: true }
  const user = toUser(tokens)
  const client = createApolloClient(user.token)
  try {
    await client.query({
      query: GET_PRIVATE_PREVIEW_ACCESS,
      variables: { id: journeyId, expectedRevision: revision },
      fetchPolicy: 'no-cache'
    })
  } catch {
    return { notFound: true }
  }
  return {
    props: {
      privatePreview: true,
      journeyId,
      revision: revision ?? null,
      userSerialized: JSON.stringify(user),
      ...(await serverSideTranslations(
        ctx.locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
}
