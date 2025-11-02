import { gql } from '@apollo/client'

export const GET_MUX_VIDEO_WITH_SUBTITLES = gql`
  query GetMuxVideoWithSubtitles($id: ID!, $userGenerated: Boolean) {
    getMyMuxVideo(id: $id, userGenerated: $userGenerated) {
      id
      assetId
      playbackId
      readyToStream
      duration
      subtitles {
        id
        trackId
        languageCode
        muxLanguageName
        readyToStream
        source
      }
    }
  }
`

export const CREATE_MUX_GENERATED_SUBTITLES = gql`
  mutation CreateMuxGeneratedSubtitles(
    $assetId: ID!
    $languageCode: String!
    $name: String!
    $userGenerated: Boolean
  ) {
    createMuxGeneratedSubtitlesByAssetId(
      assetId: $assetId
      languageCode: $languageCode
      name: $name
      userGenerated: $userGenerated
    ) {
      ... on MutationCreateMuxGeneratedSubtitlesByAssetIdSuccess {
        data {
          id
          trackId
          languageCode
          muxLanguageName
          readyToStream
          source
        }
      }
      ... on Error {
        message
      }
      ... on ZodError {
        message
        fieldErrors {
          message
          path
        }
      }
    }
  }
`

export const GET_MUX_SUBTITLE_TRACK = gql`
  query GetMuxSubtitleTrack($id: ID!, $userGenerated: Boolean) {
    getMyMuxSubtitleTrack(id: $id, userGenerated: $userGenerated) {
      ... on QueryGetMyMuxSubtitleTrackSuccess {
        data {
          id
          trackId
          languageCode
          muxLanguageName
          readyToStream
          source
        }
      }
      ... on Error {
        message
      }
    }
  }
`
