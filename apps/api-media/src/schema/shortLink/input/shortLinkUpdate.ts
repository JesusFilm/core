import { builder } from '../../builder'

export const ShortLinkUpdateInput = builder.inputType('ShortLinkUpdateInput', {
  fields: (t) => ({
    to: t.string({ required: true })
  })
})
