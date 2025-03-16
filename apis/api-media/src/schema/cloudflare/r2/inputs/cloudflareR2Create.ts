import { builder } from '../../../builder'

export const CloudflareR2CreateInput = builder.inputType(
  'CloudflareR2CreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      contentLength: t.int({
        required: true,
        description: 'the size of the file that is being uploaded'
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
      videoId: t.string({
        required: true,
        description:
          'the id of the Video object this file relates to in the database'
      })
    })
  }
)
