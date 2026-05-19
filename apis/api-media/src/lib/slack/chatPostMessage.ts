import fetch from 'node-fetch'
import { Logger } from 'pino'

import type { SlackBotChannelConfig } from './config'

const slackApiUrl = 'https://slack.com/api/chat.postMessage'

interface SlackApiResponse {
  ok?: boolean
  error?: string
  ts?: string
}

/**
 * Low-level Slack `chat.postMessage`. Always sets `channel` from config.
 */
export async function slackChatPostMessage(args: {
  config: SlackBotChannelConfig
  body: Record<string, unknown>
  log: Logger
  failureMessage: string
  errorMessage: string
}): Promise<string | undefined> {
  const { config, body, log, failureMessage, errorMessage } = args

  const payload = {
    ...body,
    channel: config.channelId
  }

  try {
    const response = await fetch(slackApiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload),
      timeout: 10000
    })

    const data = (await response.json()) as SlackApiResponse

    if (!response.ok || data.ok !== true) {
      log.warn(
        {
          error: data.error,
          status: response.status
        },
        failureMessage
      )
      return undefined
    }

    return data.ts
  } catch (err) {
    log.warn({ err }, errorMessage)
    return undefined
  }
}
