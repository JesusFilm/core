import { graphql } from 'gql.tada'

export const CREATE_CLOUDFLARE_R2_ASSET = graphql(`
  mutation CreateCloudflareR2Asset($input: CloudflareR2CreateInput!) {
    cloudflareR2Create(input: $input) {
      id
      uploadUrl
      publicUrl
      originalFilename
      fileName
    }
  }
`)

export const CREATE_MUX_VIDEO = graphql(`
  mutation CreateMuxVideoUploadByUrl($url: String!, $userGenerated: Boolean) {
    createMuxVideoUploadByUrl(url: $url, userGenerated: $userGenerated) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`)

export const CREATE_VIDEO_VARIANT = graphql(`
  mutation CreateVideoVariant($input: VideoVariantCreateInput!) {
    videoVariantCreate(input: $input) {
      id
      videoId
      slug
      hls
      share
      published
      lengthInMilliseconds
      duration
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

export const UPDATE_VIDEO_VARIANT = graphql(`
  mutation UpdateVideoVariant($input: VideoVariantUpdateInput!) {
    videoVariantUpdate(input: $input) {
      id
      videoId
      slug
      hls
      published
      lengthInMilliseconds
      duration
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

export const CREATE_VIDEO_SUBTITLE = graphql(`
  mutation CreateVideoSubtitle($input: VideoSubtitleCreateInput!) {
    videoSubtitleCreate(input: $input) {
      id
      vttSrc
      srtSrc
      vttAsset {
        id
      }
      srtAsset {
        id
      }
      srtVersion
      vttVersion
      value
      primary
      edition
      language {
        id
        name {
          value
          primary
        }
        slug
      }
    }
  }
`)

export const UPDATE_VIDEO_SUBTITLE = graphql(`
  mutation UpdateVideoSubtitle($input: VideoSubtitleUpdateInput!) {
    videoSubtitleUpdate(input: $input) {
      id
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
