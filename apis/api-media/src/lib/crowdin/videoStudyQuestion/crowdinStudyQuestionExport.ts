import { Logger } from 'pino'

import { CROWDIN_CONFIG } from '../../../workers/crowdin/config'
import { apis } from '../../../workers/crowdin/importer'

export async function updateStudyQuestionInCrowdin(
  videoId: string,
  videoStudyQuestionText: string,
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
      CROWDIN_CONFIG.projectId,
      Number(crowdInId),
      [
        {
          op: 'replace',
          path: '/text',
          value: videoStudyQuestionText
        },
        {
          op: 'replace',
          path: '/identifier',
          value: videoId
        }
      ]
    )
  } catch (error) {
    logger?.error('Failed to update video study question in Crowdin:', error)
  }
}

export async function exportStudyQuestionToCrowdin(
  videoId: string,
  videoStudyQuestionText: string,
  order: number,
  logger?: Logger
): Promise<string | null> {
  try {
    const crowdInResponse = await apis.sourceStrings.addString(
      CROWDIN_CONFIG.projectId,
      {
        fileId: CROWDIN_CONFIG.files.study_questions.id,
        identifier: videoId,
        text: videoStudyQuestionText,
        context: `StudyQuestion for videoId: ${videoId}, Order: ${order}`
      }
    )

    return crowdInResponse.data.id.toString()
  } catch (error) {
    logger?.error('Failed to export video StudyQuestion to Crowdin:', error)
    return null
  }
}
