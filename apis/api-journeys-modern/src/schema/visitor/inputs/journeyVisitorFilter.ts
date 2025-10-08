import { builder } from '../../builder'

export const JourneyVisitorFilter = builder.inputType('JourneyVisitorFilter', {
  fields: (t) => ({
    journeyId: t.string({ required: true }),
    hasChatStarted: t.boolean({ required: false }),
    hasPollAnswers: t.boolean({ required: false }),
    hasMultiselectSubmission: t.boolean({ required: false }),
    hasTextResponse: t.boolean({ required: false }),
    hasIcon: t.boolean({ required: false }),
    hideInactive: t.boolean({ required: false }),
    countryCode: t.string({ required: false })
  })
})
