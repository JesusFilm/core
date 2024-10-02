import { builder } from '../../builder'
import { VideoLabel } from '../enums/videoLabel'

export const VideoUpdateInput = builder.inputType('VideoUpdateInput', {
  fields: (t) => ({
    id: t.string({ required: true }),
    // label: t.field({ type: VideoLabel, required: false }),
    primaryLanguageId: t.string({ required: false }),
    published: t.boolean({ required: false }),
    slug: t.string({ required: false }),
    noIndex: t.boolean({ required: false })
  })
})
