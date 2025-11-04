import { builder } from '../../builder'

export const VideoVariantFilter = builder.inputType('VideoVariantFilter', {
  fields: (t) => ({
    onlyPublished: t.boolean({ required: false, defaultValue: true })
  })
})
