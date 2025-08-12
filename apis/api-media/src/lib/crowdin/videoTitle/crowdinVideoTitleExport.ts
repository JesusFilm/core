import { Logger } from 'pino'

import { CROWDIN_CONFIG } from '../../../workers/crowdin/config'
import { apis } from '../../../workers/crowdin/importer'

export async function updateVideoTitleInCrowdin(
  videoId: string,
  videoTitleText: string,
  crowdInId: string | null,
  logger?: Logger
): Promise<void> {
  logger?.info('Starting video title update to Crowdin')

  if (crowdInId === null) {
    logger?.info('No Crowdin ID provided, skipping update')
    return
  }

  try {
    await apis.sourceStrings.editString(
      process.env.CROWDIN_PROJECT_ID,
      Number(crowdInId),
      [
        {
          op: 'replace',
          path: '/text',
          value: videoTitleText
        },
        {
          op: 'replace',
          path: '/identifier',
          value: videoId
        }
      ]
    )
  } catch (error) {
    logger?.error('Failed to update video title in Crowdin:', error)
  }
}

export async function exportVideoTitleToCrowdin(
  videoId: string,
  videoTitleText: string,
  logger?: Logger
): Promise<string | null> {
  logger?.info('Starting video title export to Crowdin')

  try {
    const crowdInResponse = await apis.sourceStrings.addString(
      process.env.CROWDIN_PROJECT_ID,
      {
        fileId: CROWDIN_CONFIG.files.media_metadata_tile.id,
        identifier: videoId,
        text: videoTitleText,
        context: `Title for videoId: ${videoId}`
      }
    )
    logger?.info(`Successfully exported video title ${videoId} to Crowdin`)

    return crowdInResponse.data.id.toString()
  } catch (error) {
    logger?.error('Failed to export video title to Crowdin:', error)
    return null
  }
}
