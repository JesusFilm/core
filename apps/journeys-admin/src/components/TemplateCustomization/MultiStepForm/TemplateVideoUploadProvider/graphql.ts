import { gql } from '@apollo/client'

/**
 * Creates a Mux video upload by file name; returns an upload URL and Mux video ID.
 */
export const CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION = gql`
  mutation TemplateVideoUploadCreateMuxVideoUploadByFileMutation(
    $name: String!
  ) {
    createMuxVideoUploadByFile(name: $name) {
      uploadUrl
      id
    }
  }
`

/**
 * Fetches Mux video status; used to poll until readyToStream is true.
 */
export const GET_MY_MUX_VIDEO_QUERY = gql`
  query TemplateVideoUploadGetMyMuxVideoQuery($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`
