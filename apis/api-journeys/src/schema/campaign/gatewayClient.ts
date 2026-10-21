import { GatewayError, graphqlRequest } from '../../lib/gateway/graphqlRequest'

export interface GatewayLanguage {
  id: string
  bcp47: string | null
}

/** Resolve an api-languages Language by id; `null` when it does not exist. */
export async function fetchLanguage(
  id: string
): Promise<GatewayLanguage | null> {
  const query = `
    query CampaignLanguage($id: ID!) {
      language(id: $id) {
        id
        bcp47
      }
    }
  `
  const data = await graphqlRequest(query, { id })
  const language = data.language as GatewayLanguage | null | undefined
  return language ?? null
}

export interface GatewayWatchVideo {
  id: string
  label: string
  childrenCount: number
}

/**
 * api-media's `video` is non-null and throws "Video not found" for an id or
 * slug that resolves to no published video, so the gateway answers an
 * unknown video with `data.video` null and only that error. Any other error
 * is a failure, not an unknown video.
 */
function isUnknownVideo(error: unknown): boolean {
  return (
    error instanceof GatewayError &&
    error.data?.video == null &&
    error.gatewayErrors.length > 0 &&
    error.gatewayErrors.every(({ message }) =>
      message.startsWith('Video not found')
    )
  )
}

async function fetchWatchVideo(
  query: string,
  id: string
): Promise<GatewayWatchVideo | null> {
  try {
    const data = await graphqlRequest(query, { id })
    const video = data.video as GatewayWatchVideo | null | undefined
    return video ?? null
  } catch (error) {
    if (isUnknownVideo(error)) return null
    throw error
  }
}

/**
 * Resolve a Watch variant slug (`<videoSlug>/<languageSlug>`) to its Video
 * through api-media's `video(id, idType: slug)`, which serves published
 * videos only; `null` when the slug resolves to nothing. A gateway failure
 * throws.
 */
export async function fetchWatchVideoBySlug(
  slug: string
): Promise<GatewayWatchVideo | null> {
  const query = `
    query CampaignWatchVideo($id: ID!) {
      video(id: $id, idType: slug) {
        id
        label
        childrenCount
      }
    }
  `
  return await fetchWatchVideo(query, slug)
}

/**
 * Resolve a Watch Video by its database id through api-media's
 * `video(id, idType: databaseId)`, which serves published videos only;
 * `null` when the id resolves to nothing. A gateway failure throws.
 */
export async function fetchWatchVideoById(
  id: string
): Promise<GatewayWatchVideo | null> {
  const query = `
    query CampaignWatchVideoById($id: ID!) {
      video(id: $id, idType: databaseId) {
        id
        label
        childrenCount
      }
    }
  `
  return await fetchWatchVideo(query, id)
}

export interface GatewayCountry {
  id: string
}

/** Resolve an api-languages Country by id; `null` when it does not exist. */
export async function fetchCountry(id: string): Promise<GatewayCountry | null> {
  const query = `
    query CampaignCountry($id: ID!) {
      country(id: $id) {
        id
      }
    }
  `
  const data = await graphqlRequest(query, { id })
  const country = data.country as GatewayCountry | null | undefined
  return country ?? null
}

/**
 * The English name of an api-languages Language, for machine-translation
 * prompts; `null` when the language does not exist.
 */
export async function fetchLanguageName(id: string): Promise<string | null> {
  const query = `
    query CampaignLanguageName($id: ID!) {
      language(id: $id) {
        id
        name(languageId: "529") {
          value
          primary
        }
      }
    }
  `
  const data = await graphqlRequest(query, { id })
  const language = data.language as
    | { name: Array<{ value: string; primary: boolean }> }
    | null
    | undefined
  if (language == null) return null
  const names = language.name
  return (names.find((name) => !name.primary) ?? names[0])?.value ?? null
}
