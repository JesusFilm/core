import { builder, DateTimeFilter } from '../../builder'

export const VideoVariantFilter = builder.inputType('VideoVariantFilter', {
  fields: (t) => ({
    onlyPublished: t.boolean({ required: false, defaultValue: true }),
    languageId: t.id({ required: false }),
    updatedAt: t.field({ type: DateTimeFilter, required: false })
  })
})
