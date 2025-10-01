import { builder } from '../../builder'

export const QrCodeCreateInput = builder.inputType('QrCodeCreateInput', {
  fields: (t) => ({
    teamId: t.id({ required: true }),
    journeyId: t.id({ required: true })
  })
})
