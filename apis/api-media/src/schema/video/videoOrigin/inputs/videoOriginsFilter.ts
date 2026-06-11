import { DateTimeFilter, builder } from '../../../builder'

export const VideoOriginsFilter = builder.inputType('VideoOriginsFilter', {
  fields: (t) => ({
    updatedAt: t.field({ type: DateTimeFilter, required: false })
  })
})
