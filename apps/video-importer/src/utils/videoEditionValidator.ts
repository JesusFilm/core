import { env } from '../env'
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

/**
 * Extract a useful message plus a hint about whether the failure was a
 * transport-level issue (connection refused / DNS / TLS / timeout) as opposed
 * to a GraphQL response error. Transport errors get a clearer prefix that
 * points at `GRAPHQL_ENDPOINT`, since the generic `graphql-request` message
 * ("Unable to connect…") hides the actual URL that was unreachable.
 */
function describeGraphQLError(error: unknown): string {
  const gqlErrors = (
    error as { response?: { errors?: Array<{ message?: string }> } }
  ).response?.errors
  if (gqlErrors && gqlErrors.length > 0) {
    const first = gqlErrors[0]?.message ?? 'unknown GraphQL error'
    return `Validation query rejected by server: ${first}`
  }

  const raw =
    error instanceof Error && error.message.trim().length > 0
      ? error.message.trim()
      : String(error)
  const cause = (error as { cause?: unknown }).cause
  const causeMessage =
    cause instanceof Error && cause.message.trim().length > 0
      ? cause.message.trim()
      : typeof cause === 'string' && cause.trim().length > 0
        ? cause.trim()
        : ''
  const causeCode =
    typeof (cause as { code?: unknown })?.code === 'string'
      ? (cause as { code: string }).code
      : ''

  const combined = [raw, causeMessage, causeCode].filter(Boolean).join(' | ')
  const looksLikeTransport =
    /unable to connect|fetch failed|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|network|socket hang up|getaddrinfo/i.test(
      combined
    )

  if (looksLikeTransport) {
    return `Cannot reach GraphQL endpoint ${env.GRAPHQL_ENDPOINT} (${causeCode || 'connection failed'}). Check that GRAPHQL_ENDPOINT in .env is correct and that the backend is running and reachable from this machine.`
  }

  return `Validation query failed: ${raw}`
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
    throw new Error(describeGraphQLError(error))
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
    throw new Error(describeGraphQLError(error))
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
