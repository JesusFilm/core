import { getGraphQLClient } from '../gql/graphqlClient'

interface LanguageValidationResponse {
  language?: {
    id: string
  } | null
}

interface VideoWithEditionsResponse {
  video?: {
    id: string
    slug: string
    videoEditions?: Array<{
      id: string
      name: string
    }>
  } | null
  language?: LanguageValidationResponse['language']
}

function getGraphQLErrorMessage(error: unknown): string {
  return (
    (error as { response?: { errors?: Array<{ message?: string }> } }).response
      ?.errors?.[0]?.message ?? (error as Error).message
  )
}

export async function validateLanguage(rawLanguageId: string): Promise<void> {
  const languageId = rawLanguageId.trim()
  if (languageId.length === 0) {
    throw new Error('Missing languageId in filename')
  }

  const client = await getGraphQLClient()

  const languageQuery = `
    query ValidateLanguage($languageId: ID!) {
      language(id: $languageId) {
        id
      }
    }
  `

  let response: LanguageValidationResponse
  try {
    response = await client.request<LanguageValidationResponse>(languageQuery, {
      languageId
    })
  } catch (error) {
    throw new Error(`Failed validation query: ${getGraphQLErrorMessage(error)}`)
  }

  if (!response.language) {
    throw new Error(
      `Language with ID "${languageId}" does not exist in the database`
    )
  }
}

export async function validateVideoAndEdition(
  videoId: string,
  editionName: string,
  languageId: string
): Promise<{ editionId: string }> {
  console.log(
    `Validating video, edition, and language: ${videoId} / ${editionName} / ${languageId}`
  )

  if (languageId.length === 0) {
    throw new Error('Missing languageId in filename')
  }

  const client = await getGraphQLClient()

  const videoQuery = `
    query ValidateVideoAndLanguage($videoId: ID!, $languageId: ID!) {
      video(id: $videoId) {
        id
        slug
        videoEditions {
          id
          name
        }
      }
      language(id: $languageId) {
        id
      }
    }
  `

  let response: VideoWithEditionsResponse
  try {
    response = await client.request<VideoWithEditionsResponse>(videoQuery, {
      videoId,
      languageId
    })
  } catch (error) {
    throw new Error(`Failed validation query: ${getGraphQLErrorMessage(error)}`)
  }

  if (!response.video) {
    throw new Error(`Video with ID "${videoId}" does not exist in the database`)
  }

  const editions = response.video.videoEditions || []
  const edition = editions.find(
    (e) => e.name.toLowerCase() === editionName.toLowerCase()
  )

  if (!edition) {
    throw new Error(
      `Edition "${editionName}" does not exist for video "${videoId}". Available editions: ${editions.map((e) => e.name).join(', ')}`
    )
  }

  if (!response.language) {
    throw new Error(
      `Language with ID "${languageId}" does not exist in the database`
    )
  }

  return { editionId: edition.id }
}
