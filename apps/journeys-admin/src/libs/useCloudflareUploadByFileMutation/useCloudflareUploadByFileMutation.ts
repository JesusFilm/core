import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import { CreateCloudflareUploadByFile } from '../../../__generated__/CreateCloudflareUploadByFile'

export const CREATE_CLOUDFLARE_UPLOAD_BY_FILE = gql`
  mutation CreateCloudflareUploadByFile {
    createCloudflareUploadByFile {
      uploadUrl
      id
    }
  }
`

export function useCloudflareUploadByFileMutation(
  options?: MutationHookOptions<
    CreateCloudflareUploadByFile,
    Record<string, never>
  >
): MutationTuple<CreateCloudflareUploadByFile, Record<string, never>> {
  const mutation = useMutation<
    CreateCloudflareUploadByFile,
    Record<string, never>
  >(CREATE_CLOUDFLARE_UPLOAD_BY_FILE, options)

  return mutation
}
