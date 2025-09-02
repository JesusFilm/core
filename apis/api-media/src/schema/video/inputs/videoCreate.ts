import { builder } from '../../builder'
import { VideoLabel } from '../enums/videoLabel'

export const VideoCreateInput = builder.inputType('VideoCreateInput', {
  fields: (t) => ({
    id: t.string({ required: true }),
    label: t.field({
      type: VideoLabel,
      required: true
    }),
    primaryLanguageId: t.string({ required: true }),
    published: t.boolean({ required: true }),
    slug: t.string({ required: true }),
    noIndex: t.boolean({ required: true }),
    childIds: t.field({ type: ['String'], required: true }),
    originId: t.string({ required: true })
  })
})
