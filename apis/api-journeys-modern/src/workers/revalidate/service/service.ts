import { Job } from 'bullmq'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { Logger } from 'pino'

import { ApiRevalidateJobs, RevalidateJob } from './types'

async function sleep(ms: number | undefined): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function generateFacebookAppAccessToken(): Promise<string> {
  const appId = process.env.FACEBOOK_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('Facebook App ID or App Secret not configured')
  }

  const response = await fetch(
    `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
  )

  if (!response.ok) {
    throw new Error(`Failed to generate access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function service(
  job: Job<ApiRevalidateJobs>,
  logger?: Logger
): Promise<void> {
  switch (job.name) {
    case 'revalidate':
      await revalidate(job, logger)
      break
  }
}

export async function revalidate(job: Job<RevalidateJob>, logger?: Logger) {
  if (
    process.env.JOURNEYS_URL == null ||
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN == null
  ) {
    logger?.error(
      'JOURNEYS_URL or JOURNEYS_REVALIDATE_ACCESS_TOKEN not configured'
    )
    return
  }

  const { slug, hostname } = job.data
  const path = hostname != null ? `/${slug}` : `/home/${slug}`
  const journeyUrl =
    hostname != null
      ? `https://${hostname}${path}`
      : `${process.env.JOURNEYS_URL}${path}`

  const params: { accessToken: string; slug: string; hostname?: string } = {
    accessToken: process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN,
    slug
  }

  if (hostname != null) params.hostname = hostname

  try {
    await fetch(
      `${process.env.JOURNEYS_URL}/api/revalidate?${new URLSearchParams(
        params
      ).toString()}`
    )
    // 300ms required to invalidate edge caches
    await sleep(300)

    if (job.data.fbReScrape === true) {
      const fbAccessToken = await generateFacebookAppAccessToken()
      const formData = new FormData()
      formData.append('id', journeyUrl)
      formData.append('scrape', 'true')

      await fetch(
        `https://graph.facebook.com/v19.0/?access_token=${fbAccessToken}`,
        {
          method: 'POST',
          body: formData
        }
      )
    }
    return
  } catch (error) {
    logger?.error(`Failed to revalidate: ${error as Error}`)
    return
  }
}
