import { logger } from '../../logger'

import { slackChatPostMessage } from './chatPostMessage'
import { getMediaDataLangSlackConfig } from './config'

interface MediaOperationFailureContext {
  [key: string]: string | number | boolean | null | undefined
}

interface MediaOperationFailureArgs {
  operation: string
  error: unknown
  context?: MediaOperationFailureContext
}

/**
 * Fire-and-forget Slack notification for failed media operations. This is for
 * infrastructure/external-service failures that should be visible even when the
 * GraphQL mutation handles or swallows the underlying error.
 */
export function notifyMediaSlackOfOperationFailure(
  args: MediaOperationFailureArgs
): void {
  void (async () => {
    const childLogger = logger.child({ slack: 'media-operation-failure' })

    try {
      const config = getMediaDataLangSlackConfig(childLogger)
      if (config == null) {
        return
      }

      const errorMessage = formatError(args.error)
      const contextFields = buildContextFields(args.context ?? {})
      const actionsBlock = buildActionsBlock(args.context?.videoId)

      await slackChatPostMessage({
        config,
        body: {
          text: `Media operation failed: ${args.operation} - ${errorMessage}`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: 'Media operation failed',
                emoji: true
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Operation*\n${args.operation}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Environment*\n${getEnvironmentLabel()}`
                },
                ...contextFields
              ]
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Error*\n\`\`\`${truncate(errorMessage, 2800)}\`\`\``
              }
            },
            ...(actionsBlock != null ? [actionsBlock] : [])
          ]
        },
        log: childLogger,
        failureMessage: 'Media operation failure Slack notification failed',
        errorMessage:
          'Media operation failure Slack notification threw an error'
      })
    } catch (error) {
      childLogger.error({ error }, 'Media operation failure notifier error')
    }
  })()
}

function buildContextFields(
  context: MediaOperationFailureContext
): Array<{ type: 'mrkdwn'; text: string }> {
  return Object.entries(context)
    .flatMap(([key, value]) => {
      if (value == null || value === '') {
        return []
      }
      return [
        {
          type: 'mrkdwn' as const,
          text: `*${formatContextKey(key)}*\n${formatContextValue(value)}`
        }
      ]
    })
    .slice(0, 8)
}

function formatContextKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (first) => first.toUpperCase())
}

function formatContextValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  return `\`${truncate(String(value), 120)}\``
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
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
  return base + '/videos/' + encodeURIComponent(videoId)
}

function buildActionsBlock(
  videoId: unknown
): Record<string, unknown> | undefined {
  if (typeof videoId !== 'string' || videoId === '') {
    return undefined
  }

  return {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Open in Nexus',
          emoji: true
        },
        url: buildVideoUrl(videoId)
      }
    ]
  }
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, maxLength - 1)}...`
}

function getEnvironmentLabel(): string {
  return process.env.SERVICE_ENV === 'prod' ? 'Production' : 'Non-production'
}
