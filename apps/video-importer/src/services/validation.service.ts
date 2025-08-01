import { getGraphQLClient } from './gql/graphqlClient'

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
): Promise<{ editionId: string }> {
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
      throw new Error(
        `Video with ID "${videoId}" does not exist in the database`
      )
    }

    console.log(
      `   Video exists: ${response.video.id} (slug: ${response.video.slug})`
    )

    // Test edition existence
    const editions = response.video.videoEditions || []
    const edition = editions.find((e) => e.name === editionName)

    if (!edition) {
      console.log(`   Edition not found: ${editionName}`)
      console.log(
        `   Available editions: ${editions.map((e) => e.name).join(', ')}`
      )
      throw new Error(
        `Edition "${editionName}" does not exist for video "${videoId}". Available editions: ${editions.map((e) => e.name).join(', ')}`
      )
    }

    console.log(`   Edition exists: ${edition.name} (id: ${edition.id})`)
    console.log(`   Video "${videoId}" and edition "${editionName}" are valid`)

    return { editionId: edition.id }
  } catch (error) {
    const errorMessage = `Validation failed: ${error instanceof Error ? error.message : String(error)}`
    console.error(`   ${errorMessage}`)
    throw error
  }
}
