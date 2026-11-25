import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { NextSeo } from 'next-seo'
import type { ReactElement } from 'react'

import i18nConfig from '../../../next-i18next.config'
import { McpImageUpload } from '../../../src/components/McpImageUpload'
import {
  getAuthTokens,
  redirectToLogin,
  toUser
} from '../../../src/libs/auth/getAuthTokens'

export default function UploadPage({
  endpoint
}: {
  endpoint: string
}): ReactElement {
  return (
    <>
      <NextSeo noindex nofollow title="Upload an image" />
      <McpImageUpload endpoint={endpoint} />
    </>
  )
}
export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  ctx.res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  ctx.res.setHeader('Vary', 'Cookie')
  ctx.res.setHeader('Referrer-Policy', 'no-referrer')
  ctx.res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  const tokens = await getAuthTokens(ctx)
  if (!tokens || toUser(tokens).isAnonymous) return redirectToLogin(ctx)
  const jobId = ctx.params?.jobId
  if (
    typeof jobId !== 'string' ||
    !/^[a-f0-9-]{36}$/.test(jobId) ||
    !process.env.MCP_MEDIA_INGRESS_URL
  )
    return { notFound: true }
  const endpoint = new URL(
    `/mcp/uploads/${jobId}`,
    process.env.MCP_MEDIA_INGRESS_URL
  ).href
  const user = toUser(tokens)
  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `JWT ${user.token}` },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10000)
    })
    if (!response.ok) return { notFound: true }
  } catch {
    return { notFound: true }
  }
  return {
    props: {
      privatePreview: true,
      endpoint,
      userSerialized: JSON.stringify(user),
      ...(await serverSideTranslations(
        ctx.locale ?? 'en',
        ['apps-journeys-admin', 'libs-journeys-ui'],
        i18nConfig
      ))
    }
  }
}
