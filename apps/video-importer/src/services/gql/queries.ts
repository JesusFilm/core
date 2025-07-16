import { graphql } from '@core/shared/gql'

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

export const GET_VIDEO_EDITION = graphql(`
  query GetVideoEdition($videoId: ID!) {
    video(id: $videoId) {
      videoEditions {
        name
        id
      }
    }
  }
`)

export const GET_VIDEO_SUBTITLES_BY_EDITION = graphql(`
  query GetVideoSubtitlesByEdition($videoId: ID!, $edition: String!) {
    video(id: $videoId) {
      subtitles(edition: $edition) {
        id
        languageId
        edition
        primary
        srtAsset {
          id
        }
        srtSrc
        srtVersion
        value
        vttSrc
        vttVersion
        vttAsset {
          id
        }
      }
    }
  }
`)

export const GET_AUDIO_PREVIEW = graphql(`
  query GetAudioPreview($languageId: ID!) {
    language(id: $languageId) {
      audioPreview {
        value
        duration
        size
        bitrate
        codec
      }
    }
  }
`)
