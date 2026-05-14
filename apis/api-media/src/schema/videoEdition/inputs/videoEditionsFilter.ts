import { DateTimeFilter, builder } from '../../builder'

export const VideoEditionsFilter = builder.inputType('VideoEditionsFilter', {
  fields: (t) => ({
    updatedAt: t.field({ type: DateTimeFilter, required: false })
  })
})
