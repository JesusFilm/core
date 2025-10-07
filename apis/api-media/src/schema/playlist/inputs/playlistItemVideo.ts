import { builder } from '../../builder'

export const PlaylistItemVideoInput = builder.inputType(
  'PlaylistItemVideoInput',
  {
    fields: (t) => ({
      videoId: t.string({
        required: true,
        description: 'The video id of the video variant'
      }),
      languageId: t.string({
        required: true,
        description: 'The language id of the video variant'
      })
    }),
    description:
      'The video variant to add to the playlist. This is used instead of the videoVariantId as clients typically know the video id and language id of the video variant but not the videoVariantId.'
  }
)
