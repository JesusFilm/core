import { graphql } from 'gql.tada'

export const CREATE_R2_ASSET = graphql(`
  mutation CreateR2Asset($input: CloudflareR2CreateInput!) {
    cloudflareR2Create(input: $input) {
      uploadUrl
      publicUrl
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

export const CREATE_VIDEO_EDITION = graphql(`
  mutation CreateVideoEdition($input: VideoEditionCreateInput!) {
    videoEditionCreate(input: $input) {
      id
      name
    }
  }
`)
