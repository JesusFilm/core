import { graphql } from '@core/shared/gql'

export const GET_VIDEO_CHILDREN_FOR_PUBLISH = graphql(`
  query GetVideoChildrenForPublish($id: ID!) {
    adminVideo(id: $id) {
      id
      children {
        id
        published
        variants(input: { onlyPublished: false }) {
          id
          published
        }
      }
    }
  }
`)

export const PUBLISH_CHILDREN = graphql(`
  mutation VideoPublishChildren(
    $id: ID!
    $mode: VideoPublishMode!
    $dryRun: Boolean!
  ) {
    videoPublishChildren(id: $id, mode: $mode, dryRun: $dryRun) {
      dryRun
      publishedVideoCount
      publishedVideoIds
      publishedVariantsCount
      publishedVariantIds
      videosFailedValidation {
        videoId
        message
        missingFields
      }
    }
  }
`)
