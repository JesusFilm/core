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

/**
 * Fire-and-forget Slack notification for publisher video mutations. Calls
 * `slackChatPostMessage`; failures are logged only so they never block the
 * mutation response.
 */
export function notifyVideoSlackOfMutation(args: {
  kind: 'create' | 'update'
  video: VideoSummary
  user?: MutationUser | null
}): void {
  void (async () => {
    const childLogger = logger.child({ slack: 'video-mutation' })
    const config = getMediaDataLangSlackConfig(childLogger)
    if (config == null) {
      return
    }

    const title = args.kind === 'create' ? 'Video created' : 'Video updated'
    const label = args.video.label ?? '—'
    const idLink = buildVideoIdLink(args.video.id)
    const who = formatUser(args.user)
    const summary = `${title}: ${label} (${args.video.id})`

    await slackChatPostMessage({
      config,
      body: {
        text: summary,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: [
                `*${title}*`,
                `*Label:* ${label} · *ID:* ${idLink}`,
                `*By:* ${who}`
              ].join('\n')
            }
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

function buildVideoIdLink(videoId: string): string {
  const base =
    process.env.SERVICE_ENV === 'prod'
      ? videosAdminBaseUrl.prod
      : videosAdminBaseUrl.nonProd
  return `<${base}/videos/${videoId}|\`${videoId}\`>`
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
