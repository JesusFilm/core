import { builder } from '../../builder'

export const QrCodesFilter = builder.inputType('QrCodesFilter', {
  fields: (t) => ({
    journeyId: t.id({ required: false }),
    teamId: t.id({ required: false })
  })
})
