import { Logger } from 'pino'

import { CROWDIN_CONFIG } from '../../../workers/crowdin/config'
import { apis } from '../../../workers/crowdin/importer'

export async function updateVideoDescriptionInCrowdin(
  videoId: string,
  videoDescriptionText: string,
  crowdInId: string | null,
  logger?: Logger
): Promise<void> {
  logger?.info('Starting video description update to Crowdin')

  if (crowdInId === null) {
    logger?.info('No Crowdin ID provided, skipping update')
    return
  }

  try {
    await apis.sourceStrings.editString(
      CROWDIN_CONFIG.projectId,
      Number(crowdInId),
      [
        {
          op: 'replace',
          path: '/text',
          value: videoDescriptionText
        },
        {
          op: 'replace',
          path: '/identifier',
          value: videoId
        }
      ]
    )
  } catch (error) {
    logger?.error('Failed to update video description in Crowdin:', error)
  }
}

export async function exportVideoDescriptionToCrowdin(
  videoId: string,
  videoDescriptionText: string,
  logger?: Logger
): Promise<string | null> {
  logger?.info('Starting video description export to Crowdin')

  try {
    const crowdInResponse = await apis.sourceStrings.addString(
      CROWDIN_CONFIG.projectId,
      {
        fileId: CROWDIN_CONFIG.files.media_metadata_description.id,
        identifier: videoId,
        text: videoDescriptionText,
        context: `Description for videoId: ${videoId}`
      }
    )
    logger?.info(
      `Successfully exported video description ${videoId} to Crowdin`
    )

    return crowdInResponse.data.id.toString()
  } catch (error) {
    logger?.error('Failed to export video description to Crowdin:', error)
    return null
  }
}
