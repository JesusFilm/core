import type { ReadStream } from 'fs'

import { CreateMuxVideoUploadByFileMutationVariables } from '../../../../../../../../../../__generated__/CreateMuxVideoUploadByFileMutation'

export function fileToMuxUpload(file: File): {
  variables: CreateMuxVideoUploadByFileMutationVariables
} {
  const fileName = file.name.split('.')[0]
  return {
    variables: {
      name: fileName
    }
  }
}

export function getBuffer(file: File): ReadStream | File {
  // the following if statement is required for testing in jest
  let buffer: ReadStream | File
  if (process.env.NODE_ENV === 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    buffer = require('fs').createReadStream(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('path').join(
        __dirname,
        (file as unknown as { path: string }).path
      )
    )
  } else {
    buffer = file
  }
  return buffer
}
