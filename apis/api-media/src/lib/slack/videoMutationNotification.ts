import { logger } from '../../logger'

import { slackChatPostMessage } from './chatPostMessage'
import { getMediaDataLangSlackConfig } from './config'

interface VideoSummary {
  id: string
  label?: string | null
}

interface MutationUser {
  id: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
}

interface VideoMutationChange {
  field: string
  before: string
  after: string
}

/**
 * Fire-and-forget Slack notification for publisher video mutations. Calls
 * `slackChatPostMessage`; failures are logged only so they never block the
 * mutation response.
 */
export function notifyVideoSlackOfMutation(args: {
  kind: 'create' | 'update'
  video: VideoSummary
  user?: MutationUser | null
  changes?: VideoMutationChange[]
}): void {
  void (async () => {
    const childLogger = logger.child({ slack: 'video-mutation' })
    const config = getMediaDataLangSlackConfig(childLogger)
    if (config == null) {
      return
    }

    const title = args.kind === 'create' ? 'Video created' : 'Video updated'
    const label = args.video.label ?? '—'
    const who = formatUser(args.user)
    const videoUrl = buildVideoUrl(args.video.id)
    const summary = `${title}: ${label} (${args.video.id}) by ${who}`
    const changesBlock = buildChangesBlock(args.changes ?? [])

    await slackChatPostMessage({
      config,
      body: {
        text: summary,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: title,
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Label*\n${label}`
              },
              {
                type: 'mrkdwn',
                text: `*Video ID*\n\`${args.video.id}\``
              },
              {
                type: 'mrkdwn',
                text: `*By*\n${who}`
              },
              {
                type: 'mrkdwn',
                text: `*Environment*\n${getEnvironmentLabel()}`
              }
            ]
          },
          ...(changesBlock != null ? [changesBlock] : []),
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Open in Nexus',
                  emoji: true
                },
                url: videoUrl
              }
            ]
          }
        ]
      },
      log: childLogger,
      failureMessage: 'Video mutation Slack notification failed',
      errorMessage: 'Video mutation Slack notification threw an error'
    })
  })()
}

const videosAdminBaseUrl = {
  prod: 'https://nexus.jesusfilm.org',
  nonProd: 'https://nexus-stage.jesusfilm.org'
} as const

function buildVideoUrl(videoId: string): string {
  const base =
    process.env.SERVICE_ENV === 'prod'
      ? videosAdminBaseUrl.prod
      : videosAdminBaseUrl.nonProd
  return `${base}/videos/${encodeURIComponent(videoId)}`
}

function getEnvironmentLabel(): string {
  return process.env.SERVICE_ENV === 'prod' ? 'Production' : 'Non-production'
}

function formatUser(user: MutationUser | null | undefined): string {
  if (user == null) {
    return '_unknown_'
  }
  if (user.email != null && user.email !== '') {
    return user.email
  }
  const fullName = [user.firstName, user.lastName]
    .filter((part) => part != null && part !== '')
    .join(' ')
    .trim()
  if (fullName !== '') {
    return fullName
  }
  return user.id
}

function buildChangesBlock(changes: VideoMutationChange[]):
  | {
      type: 'section'
      text: { type: 'mrkdwn'; text: string }
    }
  | undefined {
  if (changes.length === 0) {
    return undefined
  }

  return {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: ['*Changes*', ...changes.map(formatChangeLine)].join('\n')
    }
  }
}

function formatChangeLine(change: VideoMutationChange): string {
  return `*${change.field}:* ${change.before} -> ${change.after}`
}
