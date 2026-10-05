import { Job } from 'bullmq'
import FormData from 'form-data'
import fetch from 'node-fetch'
import { Logger } from 'pino'

import { env } from '../../../env'

import {
  ApiRevalidateJobs,
  RevalidatePathsJob,
  RevalidateSlugJob,
  isRevalidatePathsJob
} from './types'

async function sleep(ms: number | undefined): Promise<void> {
  return await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function generateFacebookAppAccessToken(): Promise<string> {
  const appId = env.FACEBOOK_APP_ID
  const appSecret = env.FACEBOOK_APP_SECRET

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
      if (isRevalidatePathsJob(job.data)) {
        await revalidatePaths(job as Job<RevalidatePathsJob>, logger)
        break
      }
      await revalidate(job as Job<RevalidateSlugJob>, logger)
      break
  }
}

/**
 * The `paths[]` job variant: one `/api/revalidate` call per Next.js page path,
 * for pages that are not addressed by a journey slug (the campaign pages).
 */
export async function revalidatePaths(
  job: Job<RevalidatePathsJob>,
  logger?: Logger
): Promise<void> {
  for (const path of job.data.paths) {
    const params = new URLSearchParams({
      accessToken: env.JOURNEYS_REVALIDATE_ACCESS_TOKEN,
      path
    })
    try {
      await fetch(`${env.JOURNEYS_URL}/api/revalidate?${params.toString()}`)
    } catch (error) {
      logger?.error(`Failed to revalidate ${path}: ${error as Error}`)
    }
  }
}

export async function revalidate(
  job: Job<RevalidateSlugJob>,
  logger?: Logger
) {
  const { slug, hostname } = job.data
  const path = hostname != null ? `/${slug}` : `/home/${slug}`
  const journeyUrl =
    hostname != null
      ? `https://${hostname}${path}`
      : `${env.JOURNEYS_URL}${path}`

  const params: { accessToken: string; slug: string; hostname?: string } = {
    accessToken: env.JOURNEYS_REVALIDATE_ACCESS_TOKEN,
    slug
  }

  if (hostname != null) params.hostname = hostname

  try {
    await fetch(
      `${env.JOURNEYS_URL}/api/revalidate?${new URLSearchParams(
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
