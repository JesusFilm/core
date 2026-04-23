import { Logger } from 'pino'

import { logger } from '../../logger'

export interface SlackBotChannelConfig {
  token: string
  channelId: string
}

/**
 * Slack bot + channel used for api-media video notifications (weekly summary,
 * mutation posts). Values come from Doppler project `api-media` and must be
 * listed in `apis/api-media/infrastructure/locals.tf` for ECS.
 */
export function getMediaDataLangSlackConfig(
  currentLogger: Logger = logger
): SlackBotChannelConfig | null {
  const token = process.env.SLACK_VIDEO_ADMIN_BOT_TOKEN
  const channelId = process.env.SLACK_DATA_LANGS_CHANNEL_ID

  if (!token || !channelId) {
    currentLogger.warn(
      'Skipping video Slack notification because SLACK_VIDEO_ADMIN_BOT_TOKEN or SLACK_DATA_LANGS_CHANNEL_ID is missing'
    )
    return null
  }

  return { token, channelId }
}
