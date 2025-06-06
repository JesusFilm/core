import { graphql } from 'gql.tada'

export const GET_MUX_VIDEO = graphql(`
  query GetMyMuxVideo($id: ID!, $userGenerated: Boolean) {
    getMyMuxVideo(id: $id, userGenerated: $userGenerated) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`)

export const GET_VIDEO_DETAILS_FOR_VARIANT_UPSERT = graphql(`
  query GetVideoDetailsForVariantUpsert($videoId: ID!, $languageId: ID!) {
    video(id: $videoId) {
      id
      slug
      variant(languageId: $languageId) {
        id
        slug
      }
    }
    language(id: $languageId) {
      id
      slug
    }
  }
`)
