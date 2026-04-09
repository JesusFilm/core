import fetch from 'node-fetch'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

const slackApiUrl = 'https://slack.com/api/chat.postMessage'
const oneWeekInDays = 7
const maxVideosPerSection = 20

interface WeeklySummaryVideo {
  id: string
  label: string
  slug?: string | null
  createdAt: Date
  updatedAt: Date
}

interface SlackApiResponse {
  ok?: boolean
  error?: string
}

interface SlackConfig {
  channelId: string
  token: string
}

function getSlackConfig(): SlackConfig | null {
  const token = process.env.VIDEO_SLACK_BOT_TOKEN
  const channelId = process.env.VIDEO_SLACK_CHANNEL_ID

  if (!token || !channelId) {
    logger.warn(
      'Skipping video Slack notification because VIDEO_SLACK_BOT_TOKEN or VIDEO_SLACK_CHANNEL_ID is missing'
    )
    return null
  }

  return { token, channelId }
}

function formatDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function formatVideoLine(
  video: WeeklySummaryVideo,
  dateLabel: string,
  date: Date
): string {
  const slug =
    video.slug != null && video.slug !== '' ? ` • slug: ${video.slug}` : ''

  return `• ${video.id} • ${video.label} • ${dateLabel}: ${formatDate(date)}${slug}`
}

function buildSectionText(
  title: string,
  videos: WeeklySummaryVideo[],
  dateLabel: string,
  getDate: (video: WeeklySummaryVideo) => Date
): string {
  if (videos.length === 0) {
    return `*${title} (0)*\nNone`
  }

  const visibleVideos = videos
    .slice(0, maxVideosPerSection)
    .map((video) => formatVideoLine(video, dateLabel, getDate(video)))
  const hiddenCount = videos.length - visibleVideos.length

  return [
    `*${title} (${videos.length})*`,
    ...visibleVideos,
    hiddenCount > 0 ? `• and ${hiddenCount} more` : null
  ]
    .filter((line): line is string => line != null)
    .join('\n')
}

function buildBlocks({
  createdVideos,
  updatedVideos,
  startDate,
  endDate
}: {
  createdVideos: WeeklySummaryVideo[]
  updatedVideos: WeeklySummaryVideo[]
  startDate: Date
  endDate: Date
}): unknown[] {
  const summaryText = `Window: ${formatDate(startDate)} to ${formatDate(endDate)}`

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: 'Weekly video summary' }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Created:* ${createdVideos.length}\n*Updated:* ${updatedVideos.length}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: buildSectionText(
          'Created videos',
          createdVideos,
          'created',
          (video) => video.createdAt
        )
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: buildSectionText(
          'Updated videos',
          updatedVideos,
          'updated',
          (video) => video.updatedAt
        )
      }
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: summaryText }]
    }
  ]
}

async function postWeeklyVideoSlackMessage({
  createdVideos,
  updatedVideos,
  startDate,
  endDate,
  childLogger
}: {
  createdVideos: WeeklySummaryVideo[]
  updatedVideos: WeeklySummaryVideo[]
  startDate: Date
  endDate: Date
  childLogger: Logger
}): Promise<void> {
  const config = getSlackConfig()
  if (config == null) return

  try {
    const response = await fetch(slackApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        channel: config.channelId,
        blocks: buildBlocks({
          createdVideos,
          updatedVideos,
          startDate,
          endDate
        })
      })
    })

    const data = (await response.json()) as SlackApiResponse

    if (!response.ok || data.ok !== true) {
      childLogger.warn(
        {
          error: data.error,
          status: response.status
        },
        'Weekly video Slack summary failed'
      )
    }
  } catch (error) {
    childLogger.warn(
      {
        error
      },
      'Weekly video Slack summary threw an error'
    )
  }
}

async function getCreatedVideos(
  startDate: Date
): Promise<WeeklySummaryVideo[]> {
  return await prisma.video.findMany({
    where: {
      createdAt: {
        gte: startDate
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      label: true,
      slug: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

async function getUpdatedVideos(
  startDate: Date
): Promise<WeeklySummaryVideo[]> {
  return await prisma.video.findMany({
    where: {
      createdAt: {
        lt: startDate
      },
      updatedAt: {
        gte: startDate
      }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    select: {
      id: true,
      label: true,
      slug: true,
      createdAt: true,
      updatedAt: true
    }
  })
}

export async function sendWeeklyVideoSummary(
  currentDate = new Date(),
  currentLogger: Logger = logger
): Promise<void> {
  const childLogger = currentLogger.child({
    report: 'weekly-video-summary'
  })
  const startDate = new Date(currentDate)
  startDate.setUTCDate(startDate.getUTCDate() - oneWeekInDays)

  const [createdVideos, updatedVideos] = await Promise.all([
    getCreatedVideos(startDate),
    getUpdatedVideos(startDate)
  ])

  if (createdVideos.length === 0 && updatedVideos.length === 0) {
    childLogger.info('No videos were created or updated in the last week')
    return
  }

  await postWeeklyVideoSlackMessage({
    createdVideos,
    updatedVideos,
    startDate,
    endDate: currentDate,
    childLogger
  })
}
