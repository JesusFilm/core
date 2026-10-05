import { builder } from '../../../builder'

export const IntegrationGoogleCreateInput = builder.inputType(
  'IntegrationGoogleCreateInput',
  {
    fields: (t) => ({
      teamId: t.string({ required: true }),
      code: t.string({ required: true }),
      redirectUri: t.string({ required: true })
    })
  }
)
