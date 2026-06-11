import { Logger } from 'pino'

import { logger } from '../../logger'

export interface SlackBotChannelConfig {
  token: string
  channelId: string
}

function getSlackConfig(args: {
  tokenEnvName: string
  channelEnvName: string
  currentLogger: Logger
}): SlackBotChannelConfig | null {
  const { tokenEnvName, channelEnvName, currentLogger } = args
  const token = process.env[tokenEnvName]
  const channelId = process.env[channelEnvName]

  if (!token || !channelId) {
    currentLogger.warn(
      `Skipping video Slack notification because ${tokenEnvName} or ${channelEnvName} is missing`
    )
    return null
  }

  return { token, channelId }
}

/**
 * Slack bot + channel used for api-media video notifications (daily summary,
 * mutation posts). Values come from Doppler project `api-media` and must be
 * listed in `apis/api-media/infrastructure/locals.tf` for ECS.
 */
export function getMediaDataLangSlackConfig(
  currentLogger: Logger = logger
): SlackBotChannelConfig | null {
  return getSlackConfig({
    tokenEnvName: 'SLACK_VIDEO_ADMIN_BOT_TOKEN',
    channelEnvName: 'SLACK_DATA_LANGS_CHANNEL_ID',
    currentLogger
  })
}

/**
 * Slack bot + channel used for the delayed Production Managers flagship
 * report. Uses the same bot token as other api-media video notifications.
 */
export function getProductionManagersSlackConfig(
  currentLogger: Logger = logger
): SlackBotChannelConfig | null {
  return getSlackConfig({
    tokenEnvName: 'SLACK_VIDEO_ADMIN_BOT_TOKEN',
    channelEnvName: 'SLACK_PRODUCTION_MANAGERS_CHANNEL_ID',
    currentLogger
  })
}
