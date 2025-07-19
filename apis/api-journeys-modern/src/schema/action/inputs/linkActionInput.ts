import { builder } from '../../builder'

export const LinkActionInput = builder.inputType('LinkActionInput', {
  fields: (t) => ({
    gtmEventName: t.string({ required: false }),
    url: t.string({ required: true }),
    target: t.string({ required: false })
  })
})
