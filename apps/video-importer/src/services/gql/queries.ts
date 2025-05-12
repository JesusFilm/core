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

export const GET_LANGUAGE_SLUG = graphql(`
  query GetLanguageSlug($id: ID!) {
    language(id: $id) {
      id
      slug
    }
  }
`)

export const GET_VIDEO_SLUG = graphql(`
  query GetVideoSlug($id: ID!) {
    video(id: $id) {
      id
      slug
    }
  }
`)
