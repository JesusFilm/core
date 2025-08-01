import { getGraphQLClient } from './gql/graphqlClient'

export interface ValidationResult {
  success: boolean
  errors: string[]
  videoExists?: boolean
  editionExists?: boolean
  videoId?: string
  editionName?: string
  editionId?: string
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
}

export async function validateVideoAndEdition(
  videoId: string,
  editionName: string
): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: false,
    errors: [],
    videoId,
    editionName
  }

  try {
    console.log(`Validating video and edition: ${videoId} / ${editionName}`)

    const client = await getGraphQLClient()

    // Test video existence
    const videoQuery = `
      query ValidateVideo($videoId: ID!) {
        video(id: $videoId) {
          id
          slug
          videoEditions {
            id
            name
          }
        }
      }
    `
    const response = await client.request<VideoWithEditionsResponse>(
      videoQuery,
      { videoId }
    )

    if (!response.video) {
      console.log(`   Video not found: ${videoId}`)
      result.videoExists = false
      result.errors.push(
        `Video with ID "${videoId}" does not exist in the database`
      )
      return result
    }

    console.log(
      `   Video exists: ${response.video.id} (slug: ${response.video.slug})`
    )
    result.videoExists = true

    // Test edition existence
    const editions = response.video.videoEditions || []
    const edition = editions.find((e) => e.name === editionName)

    if (!edition) {
      console.log(`   Edition not found: ${editionName}`)
      console.log(
        `   Available editions: ${editions.map((e) => e.name).join(', ')}`
      )
      result.editionExists = false
      result.errors.push(
        `Edition "${editionName}" does not exist for video "${videoId}". Available editions: ${editions.map((e) => e.name).join(', ')}`
      )
      return result
    }

    console.log(`   Edition exists: ${edition.name} (id: ${edition.id})`)
    result.editionExists = true
    result.editionId = edition.id

    result.success = true
    return result
  } catch (error) {
    const errorMessage = `Validation failed: ${error instanceof Error ? error.message : String(error)}`
    console.error(`   ${errorMessage}`)
    result.errors.push(errorMessage)
    return result
  }
}
