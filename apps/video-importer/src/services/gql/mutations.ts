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
