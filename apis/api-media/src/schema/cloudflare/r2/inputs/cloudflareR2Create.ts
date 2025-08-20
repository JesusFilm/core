import { builder } from '../../../builder'

export const CloudflareR2CreateInput = builder.inputType(
  'CloudflareR2CreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      contentLength: t.string({
        required: true,
        description:
          'the size of the file that is being uploaded (as string to support large files)'
      }),
      contentType: t.string({
        required: true,
        description:
          'the type of file that is being uploaded. e.g. image or video/mp4'
      }),
      fileName: t.string({
        required: true,
        description: 'the name of the file that is being uploaded'
      }),
      originalFilename: t.string({
        required: false,
        description: 'the original name of the file before any renaming'
      }),
      videoId: t.string({
        required: true,
        description:
          'the id of the Video object this file relates to in the database'
      })
    })
  }
)
