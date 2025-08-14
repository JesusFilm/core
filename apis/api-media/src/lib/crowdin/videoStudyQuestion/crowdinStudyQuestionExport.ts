import { Logger } from 'pino'

import { CROWDIN_CONFIG } from '../../../workers/crowdin/config'
import { getCrowdinProjectId } from '../../../workers/crowdin/importer'
import { crowdinClient } from '../crowdinClient'

export async function updateStudyQuestionInCrowdin(
  videoId: string,
  videoStudyQuestionText: string,
  crowdInId: string | null,
  logger?: Logger
): Promise<void> {
  logger?.info('Starting video study question update to Crowdin')

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
          value: videoStudyQuestionText
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
    const crowdInResponse = await crowdinClient.sourceStringsApi.addString(
      getCrowdinProjectId(),
      {
        fileId: CROWDIN_CONFIG.files.study_questions.id,
        identifier: videoId + '_study_question_' + order,
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
