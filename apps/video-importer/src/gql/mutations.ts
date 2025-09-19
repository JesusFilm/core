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

export const CREATE_MUX_VIDEO_AND_QUEUE_UPLOAD = graphql(`
  mutation CreateMuxVideoAndQueueUpload(
    $videoId: ID!
    $edition: String!
    $languageId: ID!
    $version: Int!
    $r2PublicUrl: String!
    $originalFilename: String!
    $durationMs: Int!
    $duration: Int!
    $width: Int!
    $height: Int!
    $downloadable: Boolean
    $maxResolution: MaxResolutionTier
  ) {
    createMuxVideoAndQueueUpload(
      videoId: $videoId
      edition: $edition
      languageId: $languageId
      version: $version
      r2PublicUrl: $r2PublicUrl
      originalFilename: $originalFilename
      durationMs: $durationMs
      duration: $duration
      width: $width
      height: $height
      downloadable: $downloadable
      maxResolution: $maxResolution
    ) {
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

export const CREATE_AUDIO_PREVIEW = graphql(`
  mutation CreateAudioPreview($input: MutationAudioPreviewCreateInput!) {
    audioPreviewCreate(input: $input) {
      value
    }
  }
`)

export const UPDATE_AUDIO_PREVIEW = graphql(`
  mutation UpdateAudioPreview($input: MutationAudioPreviewUpdateInput!) {
    audioPreviewUpdate(input: $input) {
      value
    }
  }
`)
