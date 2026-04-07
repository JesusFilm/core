import { getGraphQLClient } from '../gql/graphqlClient'

interface VideoWithEditionsResponse {
  video?: {
    id: string
    slug: string
    videoEditions?: Array<{
      id: string
      name: string
    }>
  } | null
  language?: {
    id: string
  } | null
}

export async function validateVideoAndEdition(
  videoId: string,
  editionName: string,
  languageId: string
): Promise<{ editionId: string }> {
  console.log(
    `Validating video, edition, and language: ${videoId} / ${editionName} / ${languageId}`
  )

  const client = await getGraphQLClient()

  const videoQuery = `
    query ValidateVideo($videoId: ID!, $languageId: ID!) {
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
    const gqlMessage =
      (error as { response?: { errors?: Array<{ message?: string }> } })
        .response?.errors?.[0]?.message ?? (error as Error).message
    throw new Error(`Failed validation query: ${gqlMessage}`)
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
