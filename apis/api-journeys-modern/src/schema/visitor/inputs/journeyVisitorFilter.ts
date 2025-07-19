import { builder } from '../../builder'

export const JourneyVisitorFilter = builder.inputType('JourneyVisitorFilter', {
  fields: (t) => ({
    countryCode: t.string({ required: false }),
    hasIcon: t.boolean({ required: false }),
    hasChatStarted: t.boolean({ required: false }),
    hasTextResponse: t.boolean({ required: false }),
    hideInactive: t.boolean({ required: false }),
    journeyId: t.id({ required: true })
  })
})
