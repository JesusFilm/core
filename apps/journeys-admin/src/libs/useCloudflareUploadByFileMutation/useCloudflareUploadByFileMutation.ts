import { gql } from '@apollo/client';
import { useMutation } from "@apollo/client/react";

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
  options?: useMutation.Options<
    CreateCloudflareUploadByFile,
    Record<string, never>
  >
): useMutation.ResultTuple<CreateCloudflareUploadByFile, Record<string, never>> {
  const mutation = useMutation<
    CreateCloudflareUploadByFile,
    Record<string, never>
  >(CREATE_CLOUDFLARE_UPLOAD_BY_FILE, options)

  return mutation
}
