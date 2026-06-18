import { GraphQLFormattedError } from 'graphql'
import { TFunction } from 'i18next'

/**
 * Pulls the structured media-validation `reason` off a list of GraphQLErrors
 * (an ApolloError's `graphQLErrors`). Scans every error, not just `[0]`, since a
 * batched response can carry the actionable extension at any index. Returns
 * `undefined` when none carries a string `reason` (e.g. a transport/network
 * error). Shared by the save path and the live preview so both read the
 * backend's reason identically and can't drift.
 */
export function mediaErrorReason(
  graphQLErrors: ReadonlyArray<GraphQLFormattedError>
): string | undefined {
  const raw = graphQLErrors.find(
    (e) => typeof e.extensions?.reason === 'string'
  )?.extensions?.reason
  return typeof raw === 'string' ? raw : undefined
}

/**
 * Maps a backend media-validation `reason` (carried on a `BAD_USER_INPUT`
 * GraphQLError's `extensions.reason`) to a human-readable, translated message
 * shown inline on the media field. Unknown reasons fall back to a generic
 * message so an unmapped backend reason never surfaces as a raw code or a
 * crash.
 *
 * The reason set mirrors the validators in
 * `apis/api-journeys/src/schema/templateGalleryPage/media/*`.
 */
export function mediaErrorMessage(reason: string, t: TFunction): string {
  switch (reason) {
    case 'YOUTUBE_PRIVATE':
      return t(
        'This YouTube video is private. Set it to Public or Unlisted, then try again.'
      )
    case 'YOUTUBE_UNAVAILABLE':
      return t(
        'This YouTube video cannot be embedded. Check that embedding is allowed for the video.'
      )
    case 'YOUTUBE_INVALID_URL':
      return t(
        "That doesn't look like a YouTube link. Paste a valid video URL."
      )
    case 'CANVA_UNAVAILABLE':
      return t(
        "We couldn't load this Canva design. In Canva, choose Share → Anyone with the link, then paste it again."
      )
    case 'GOOGLE_SLIDES_INVALID_URL':
      return t(
        "That doesn't look like a Google Slides link. Paste a valid presentation URL."
      )
    case 'GOOGLE_SLIDES_NOT_PUBLISHED':
      return t(
        'This Google Slides presentation is not published to the web. In Slides, choose File → Share → Publish to web, then paste the link.'
      )
    case 'EMBED_HOST_NOT_ALLOWED':
      return t('That link is from a site we cannot embed.')
    case 'EMBED_HOST_BLOCKED':
      return t('That link is from a blocked site and cannot be embedded.')
    case 'MUX_NOT_READY':
      return t(
        'The video is still processing. Wait for it to finish, then save.'
      )
    case 'MUX_NOT_FOUND':
      return t('We could not find that uploaded video. Try uploading it again.')
    case 'MEDIA_INPUT_SHAPE_MISMATCH':
      return t('Something went wrong attaching that media. Try again.')
    default:
      return t("We couldn't add that media. Check the link and try again.")
  }
}
