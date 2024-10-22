import { ReadStream, createReadStream } from 'fs'
import { join } from 'path'

import { CreateCloudflareVideoUploadByFileMutationVariables } from '../../../../../../../../../__generated__/CreateCloudflareVideoUploadByFileMutation'

export function fileToCloudflareUpload(file: File): {
  variables: CreateCloudflareVideoUploadByFileMutationVariables
} {
  const fileName = file.name.split('.')[0]
  return {
    variables: {
      uploadLength: file.size,
      name: fileName
    }
  }
}

export function getBuffer(file: File): ReadStream | File {
  // the following if statement is required for testing in jest
  let buffer: ReadStream | File
  if (process.env.NODE_ENV === 'test') {
    buffer = createReadStream(
      join(__dirname, (file as unknown as { path: string }).path)
    )
  } else {
    buffer = file
  }
  return buffer
}
