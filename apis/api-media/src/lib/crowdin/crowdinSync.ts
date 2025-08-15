import { Logger } from 'pino'

import { crowdinClient, crowdinProjectId } from './crowdinClient'

const FILE_NAMES = {
  videoTitle: 'media_metadata_tile.csv',
  videoDescription: 'media_metadata_description.csv',
  videoStudyQuestion: 'study_questions.csv'
}

export async function syncWithCrowdin(
  fileType: 'videoTitle' | 'videoDescription' | 'videoStudyQuestion',
  identifier: string,
  text: string,
  context: string,
  crowdInId: string | null,
  logger?: Logger
): Promise<string | null> {
  const fileName = FILE_NAMES[fileType]

  if (crowdInId === null) {
    try {
      const response = await crowdinClient.sourceFilesApi.listProjectFiles(
        crowdinProjectId,
        {
          filter: fileName,
          limit: 1,
          offset: 0
        }
      )

      if (response.data.length === 0) {
        logger?.error(`No file found for ${fileName} in crowdin project`)
        return null
      }

      const fileId = response.data[0].data.id

      const existingString =
        await crowdinClient.sourceStringsApi.listProjectStrings(
          crowdinProjectId,
          {
            fileId: fileId,
            filter: identifier,
            limit: 1,
            offset: 0
          }
        )

      if (existingString.data.length > 0) {
        return await updateCrowdinString(
          existingString.data[0].data.id.toString(),
          text
        )
      }

      const crowdInResponse = await crowdinClient.sourceStringsApi.addString(
        crowdinProjectId,
        {
          fileId: fileId,
          identifier: identifier,
          text: text,
          context: context
        }
      )

      return crowdInResponse.data.id.toString()
    } catch (error) {
      logger?.error(`Failed to export ${fileName} to Crowdin:`, error)
      return null
    }
  }

  try {
    return await updateCrowdinString(crowdInId, text)
  } catch (error) {
    logger?.error(`Failed to update ${fileName} in Crowdin:`, error)
    return null
  }
}

async function updateCrowdinString(
  crowdinId: string,
  text: string
): Promise<string | null> {
  const response = await crowdinClient.sourceStringsApi.editString(
    crowdinProjectId,
    Number(crowdinId),
    [
      {
        op: 'replace',
        path: '/text',
        value: text
      }
    ]
  )

  return response.data.id.toString()
}
