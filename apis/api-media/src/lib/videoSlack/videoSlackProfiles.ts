import type { Logger } from 'pino'

import {
  type SlackBotChannelConfig,
  getMediaDataLangSlackConfig,
  getProductionManagersSlackConfig
} from '../slack/config'

export interface VideoSlackVideoFilter {
  ids?: string[]
  originIds?: string[]
}

export interface VideoSlackReportProfile {
  key: 'data-lang' | 'production-managers'
  loggerName: string
  title: string
  footerText: string
  getSlackConfig: (logger: Logger) => SlackBotChannelConfig | null
  videoFilter?: VideoSlackVideoFilter
}

export const productionManagerAdditionalVideoIds = [
  'MAG1',
  '2_ChosenWitness',
  '2_0-Legion'
]

const productionManagerVideoFilter: VideoSlackVideoFilter = {
  originIds: ['1'],
  ids: productionManagerAdditionalVideoIds
}

export const dataLangVideoSlackProfile: VideoSlackReportProfile = {
  key: 'data-lang',
  loggerName: 'data-lang-video-summary',
  title: 'Data-Language Daily Video Report',
  footerText:
    '<!here> The following products have been activated in production. cc: <@ULTFZGXMW> <@U4VQ0MAAG> <@U4SAGHA5Q> <@U022MSPKNSJ>',
  getSlackConfig: getMediaDataLangSlackConfig
}

export const productionManagerVideoSlackProfile: VideoSlackReportProfile = {
  key: 'production-managers',
  loggerName: 'production-manager-flagship-summary',
  title: 'Production Managers Daily Video Report',
  footerText:
    '<!here> The following products have been activated in production. cc: @david.reeves_jfp',
  getSlackConfig: getProductionManagersSlackConfig,
  videoFilter: productionManagerVideoFilter
}
