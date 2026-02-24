import { builder } from '../../../builder'

const CloudflareR2MultipartUploadedPartInput = builder.inputType(
  'CloudflareR2MultipartUploadedPartInput',
  {
    fields: (t) => ({
      partNumber: t.int({
        required: true,
        description: '1-indexed part number for the multipart upload'
      }),
      eTag: t.string({
        required: true,
        description: 'ETag returned after uploading the part'
      })
    })
  }
)

export const CloudflareR2CompleteMultipartInput = builder.inputType(
  'CloudflareR2CompleteMultipartInput',
  {
    fields: (t) => ({
      id: t.string({
        required: false,
        description: 'CloudflareR2 id for the asset being uploaded'
      }),
      fileName: t.string({
        required: true,
        description: 'Key of the multipart upload being completed'
      }),
      uploadId: t.string({
        required: true,
        description: 'Upload ID returned from create multipart upload'
      }),
      parts: t.field({
        type: [CloudflareR2MultipartUploadedPartInput],
        required: true,
        description: 'List of uploaded parts with their ETags'
      })
    })
  }
)
