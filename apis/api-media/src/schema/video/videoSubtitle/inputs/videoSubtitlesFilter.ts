import { DateTimeFilter, builder } from '../../../builder'

export const VideoSubtitlesFilter = builder.inputType('VideoSubtitlesFilter', {
  fields: (t) => ({
    updatedAt: t.field({ type: DateTimeFilter, required: false }),
    videoId: t.id({ required: false }),
    languageId: t.id({ required: false }),
    edition: t.string({ required: false }),
    primary: t.boolean({ required: false })
  })
})
