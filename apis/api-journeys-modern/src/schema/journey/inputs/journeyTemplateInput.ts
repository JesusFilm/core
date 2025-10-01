import { builder } from '../../builder'

export const JourneyTemplateInput = builder.inputType('JourneyTemplateInput', {
  fields: (t) => ({
    template: t.boolean({ required: false })
  })
})
