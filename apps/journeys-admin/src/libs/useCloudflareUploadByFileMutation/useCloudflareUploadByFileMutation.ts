import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CreateCloudflareUploadByFile,
  CreateCloudflareUploadByFileVariables
} from '../../../__generated__/CreateCloudflareUploadByFile'

export const CREATE_CLOUDFLARE_UPLOAD_BY_FILE = gql`
  mutation CreateCloudflareUploadByFile($journeyId: ID) {
    createCloudflareUploadByFile(journeyId: $journeyId) {
      uploadUrl
      id
    }
  }
`

export function useCloudflareUploadByFileMutation(
  options?: useMutation.Options<
    CreateCloudflareUploadByFile,
    CreateCloudflareUploadByFileVariables
  >
): useMutation.ResultTuple<
  CreateCloudflareUploadByFile,
  CreateCloudflareUploadByFileVariables
> {
  const mutation = useMutation<
    CreateCloudflareUploadByFile,
    CreateCloudflareUploadByFileVariables
  >(CREATE_CLOUDFLARE_UPLOAD_BY_FILE, options)

  return mutation
}
