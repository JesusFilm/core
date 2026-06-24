import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

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
  options?: MutationHookOptions<
    CreateCloudflareUploadByFile,
    CreateCloudflareUploadByFileVariables
  >
): MutationTuple<
  CreateCloudflareUploadByFile,
  CreateCloudflareUploadByFileVariables
> {
  const mutation = useMutation<
    CreateCloudflareUploadByFile,
    CreateCloudflareUploadByFileVariables
  >(CREATE_CLOUDFLARE_UPLOAD_BY_FILE, options)

  return mutation
}
