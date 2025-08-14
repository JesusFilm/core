import { Logger } from 'pino'

import { CROWDIN_CONFIG } from '../../../workers/crowdin/config'
import { getCrowdinProjectId } from '../../../workers/crowdin/importer'
import { crowdinClient } from '../crowdinClient'

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
    await crowdinClient.sourceStringsApi.editString(
      getCrowdinProjectId(),
      Number(crowdInId),
      [
        {
          op: 'replace',
          path: '/text',
          value: videoDescriptionText
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
    const crowdInResponse = await crowdinClient.sourceStringsApi.addString(
      getCrowdinProjectId(),
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
